import React, { useEffect, useState, useCallback, useRef, useMemo, Fragment } from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { Checkbox } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { getPlaylistSongs, followPlaylist, unfollowPlaylist, deleteSongFromPlaylist, getPlaylistImage, setPlaylistImage } from '../../api/playlistApi';
import { getPlaylists } from './../../api/userApi';
import { getRecommendationsByPlaylist } from './../../api/recommendationApi';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import EditPlaylistModal from './EditPlaylistModal';
import PlaylistContextMenu from './PlaylistContextMenu';
import { useHistory, Redirect } from 'react-router-dom';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import DefaultImage from './../images/genres/placeholder.png';
import { useWindowDimensions, SCREEN_SIZE } from './../../hooks/responsiveHooks';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import './PlaylistPage.scss';


function PlaylistPage() {
  const auth = useAuth();
  const history = useHistory();
  const spotify = useRef(useSpotifySdk());
  const { playlist: statePlaylist } = history.location.state || {};
  const [playlist, setPlaylist] = useState(statePlaylist || {});
  const [songList, setSongList] = useState([]);
  const [following, setFollowing] = useState(false);
  const [selected, setSelected] = useState([]);
  const [snackbarState, setSnackbarState] = useState({ open: false, message: null, severity: null });
  const ourPlaylist = playlist.owner_id === auth.id;
  const isLikedSongs = playlist.id === 'liked';
  const isHistorySongs = playlist.id === 'history';
  const [playlistModalState, setPlaylistModalState] = useState({open: false});
  const { width } = useWindowDimensions();
  const isMobile = width <= SCREEN_SIZE.SMALL;
  const [image, setImage] = useState({})

  const showAlert = (message, severity) => {
    setSnackbarState({
      open: true,
      message: message,
      severity: severity,
    })
  };

  const reloadPlaylist = useCallback(async () => {
    await getPlaylistSongs(playlist.id).then(data => {
      const songs = data;
      const tempList = [];
      Object.entries(songs).map(songKV => songKV[1]).forEach(playlistSong => {
        const song = playlistSong.song;
        tempList.push({
          id: playlistSong.id,
          songId: song.song_id,
          title: song.title,
          artists: song.artists.join(', '),
          album: song.album,
          duration: song.duration_ms,
          added: new Date(playlistSong.updated_at),
          songDetails: {
            songId: song.song_id,
            songName: song.title,
            playlistIndex: playlistSong.id,
          }
        });
      });
      // in place sort, order by adding date
      // minor bug: because the back-end stores the liked and disliked as a list and not
      // with any kind of bridging table, we're actually sorting on the SONG creation date
      // not the like for those lists.
      tempList.sort((a, b) => {
        if (a.added < b.added) return -1;
        if (a.added > b.added) return 1;
        return 0;
      });
      setSongList(tempList);
      console.log('Loaded song data for playlist ' + playlist.title);
    });
  }, [playlist.id, playlist.title]);

  const getImage = useCallback(async () => {
    await getPlaylistImage(playlist.id).then(data => {
      const retrievedImage = data.image ? (`${process.env.REACT_APP_API_URL}/media/` + data.image) : (DefaultImage);
      setImage(retrievedImage);
  })}, [playlist.id]);

  useEffect(() => {
    if (auth.id && playlist.id) {
      const updateFollowing = async () => {
        await getPlaylists(auth.id).then(data => {
          setFollowing(data.favorite_playlists.includes(playlist.id));
        });
      };
      
      updateFollowing();
      reloadPlaylist();
      getImage();
    }
  }, [auth.id, reloadPlaylist, playlist, getImage]);
  
  const msToHourMinSecondsMillis = (ms) => {
    const MS_PER_SEC = 1000;
    const SEC_PER_MIN = 60;
    const MIN_PER_HOUR = 60;

    const MS_PER_MIN = MS_PER_SEC * SEC_PER_MIN;
    const MS_PER_HOUR = MIN_PER_HOUR * MS_PER_MIN;

    const totalSeconds = Math.floor(ms / MS_PER_SEC);
    const totalMinutes = Math.floor(ms / MS_PER_MIN);
    const totalHours = Math.floor(ms / MS_PER_HOUR);

    const millis = ms % MS_PER_SEC;
    const seconds = totalSeconds % SEC_PER_MIN;
    const minutes = totalMinutes % MIN_PER_HOUR;

    return [totalHours, minutes, seconds, millis];
  }

  const mstominsecs = useCallback((ms) => {
    const [, min, sec, ] = msToHourMinSecondsMillis(ms);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  }, []);

  const msToHourMins = useCallback((ms) => {
    const [hours, min] = msToHourMinSecondsMillis(ms);
    const componentArray = [];
    if (hours) {
      componentArray.push(hours + (hours > 1 ? ' hours' : ' hour'))
    }
    if (min) {
      componentArray.push(min + ' min')
    }
    return componentArray.join(', ');
  }, []);

  const handleDeleteClicked = useCallback(() => {
    const deleteSelected = async () => {
      console.log('Deleting PlaylistSong entries with IDs', selected);
      for (let id of selected) { // change to selected after back-end fixed
        await deleteSongFromPlaylist(playlist.id, id).then(() => {
          console.log('Deleted playlist_song with id ' + id);
        }, () => {
          console.log('Failed to delete song ' + id);
        });
      }
      await reloadPlaylist();
      setSelected([]);
    };

    deleteSelected();
  }, [reloadPlaylist, playlist.id, selected]);

  const durationMs = songList.length ? songList.map(x => x.duration).reduce((prevSum, next) => (prevSum + next)) : 0;

  const handleEditPlaylist = useCallback(
    () => setPlaylistModalState({...playlistModalState, open: true, copying: false, }),
    [playlistModalState]
  );

  const handleSubmitEdit = useCallback((updatedPlaylist) => {
    if (updatedPlaylist) {
      setPlaylist({...playlist, ...updatedPlaylist});
    }
  }, [playlist]);

  const handleModalClose = useCallback(
    () => {
      setPlaylistModalState({...playlistModalState, open: false, })
    },
    [playlistModalState]
  );

  const handleHideSnackbar = useCallback(() => {
    setSnackbarState({...snackbarState, open: false});
  }, [snackbarState]);

  const handleToggleFollow = useCallback(() => {
    const toggle = async () => {
      const callback = following ? unfollowPlaylist : followPlaylist; 
      await callback(playlist.id, auth.id).then(() => {
        showAlert(`${following ? 'Unfollowed' : 'Followed'} playlist!`, 'success');
        setFollowing(!following);
      }, () => {
        showAlert(`Error trying to ${following ? 'unfollow' : 'follow'} playlist.`, 'error');
      })
    };

    toggle();
  }, [following, playlist.id, playlist.owner_id]);

  const handleSongPlayed = useCallback((index) => {
    const playSong = async (index) => {
      // mapping required because spotify hook expects the key 'id' to hold the song id
      const mappedSongs = songList.map(song => ({...song, name: song.title, id: song.songId}));
      console.log('Starting ' + mappedSongs[index].title + ' from playlist page');
      
      spotify.current.play(mappedSongs[index]);
      spotify.current.setContextPlayQueue({
        name: 'Playlist_' + playlist.id,
        songs: mappedSongs.slice(index + 1),
        getMoreSongs: () => getRecommendationsByPlaylist(playlist.id),
      });
    };

    playSong(index);
  }, [songList, playlist.id]);

  const handleDoubleClick = useCallback((event, index) => {
    event.preventDefault();
    handleSongPlayed(index);
  }, [handleSongPlayed]);

  const handleCopyPlaylist = (playlist) => {
    setPlaylistModalState({open: true, playlist: playlist, copying: true,});
  }

  const handleImageUpload = useCallback(async (image) => {
    await setPlaylistImage(playlist.id, image).then(data => {
      getImage();
    })
  }, [getImage, playlist.id]);

  const handleImageSubmit = useCallback((event) => {
    if(event.target.files[0] !== null){
      handleImageUpload(event.target.files[0])
    }
  }, [handleImageUpload]);

  const DeleteCheckboxTableCell = (props) => {
    const {song, checked} = props;
    
    const onChange = useCallback((e) => {
      if (e.target.checked){
        setSelected([...selected, song.id]);
      } else {
        const index = selected.indexOf(song.id);
        setSelected([...selected.slice(0, index), ...selected.slice(index+1)]);
      }
    }, [song.id]);

    return (
      <PlaylistTableCell align="center">
        <Checkbox color='default' 
        checked={checked}
        onChange={onChange} />
      </PlaylistTableCell>
    )
  };

  const PlaylistTableRow = ({children, ...restProps}) => (
    <TableRow
    className="playlist_table-row"
    {...restProps}>
      {children}
    </TableRow>
  )

  const PlaylistHeaderTableCell = ({children, ...restProps}) => (
    <PlaylistTableCell
    className="playlist_header-cell"
    component="th"
    scope="col"
    {...restProps}>
      {children}
    </PlaylistTableCell>
  );

  const PlaylistTableCell = ({ children, songDetails, ...restProps }) => (
    <TableCell
    className="playlist_body-cell"
    {...songDetails}
    {...restProps}>
      {children}
    </TableCell>
  )

  const MemoizedSnackBar = useMemo(() => (
    <Snackbar open={snackbarState.open} autoHideDuration={3000} onClose={handleHideSnackbar}>
      <MuiAlert
        onClose={handleHideSnackbar}
        severity={snackbarState.severity}
        elevation={6}
        variant="filled">
        {snackbarState.message}
      </MuiAlert>
    </Snackbar>
  ), [handleHideSnackbar, snackbarState.message, snackbarState.open, snackbarState.severity]);

  const MemoizedTableHead = useMemo(() => {
    return !isMobile? (
    <TableHead>
      <TableRow>
        {(ourPlaylist && !isLikedSongs && !isHistorySongs) && (
          <PlaylistHeaderTableCell align="center" width="1">
            <IconButton align='center' aria-label="delete"
              onClick={handleDeleteClicked}>
              <DeleteIcon />
            </IconButton>
          </PlaylistHeaderTableCell>
        )}
        <PlaylistHeaderTableCell>TITLE</PlaylistHeaderTableCell>
        <PlaylistHeaderTableCell align="right">ARTIST</PlaylistHeaderTableCell>
        <PlaylistHeaderTableCell align="right">ALBUM</PlaylistHeaderTableCell>
        <PlaylistHeaderTableCell align="right">DURATION</PlaylistHeaderTableCell>
        <PlaylistHeaderTableCell align="right">{isHistorySongs ? 'LISTENED' : 'ADDED'}</PlaylistHeaderTableCell>
      </TableRow>
    </TableHead>
  ) : (
  <TableHead>
    <TableRow>
      {(ourPlaylist && !isLikedSongs && !isHistorySongs) && (
        <PlaylistHeaderTableCell align="center" width="1">
          <IconButton align='center' aria-label="delete"
            onClick={handleDeleteClicked}>
            <DeleteIcon />
          </IconButton>
        </PlaylistHeaderTableCell>
      )}
      <PlaylistHeaderTableCell>TITLE</PlaylistHeaderTableCell>
      <PlaylistHeaderTableCell align="right">ARTIST</PlaylistHeaderTableCell>
      <PlaylistHeaderTableCell align="right">ALBUM</PlaylistHeaderTableCell>
      <PlaylistHeaderTableCell align="right"><AccessTimeIcon fontSize='medium'/></PlaylistHeaderTableCell>
    </TableRow>
  </TableHead>
  )
  }, [isMobile, handleDeleteClicked, isLikedSongs, isHistorySongs, ourPlaylist]);

  const MemoizedTableBody = useMemo(() => {
    return !isMobile? (
      <TableBody checkboxSelection>
        {songList.map((song, index) => (
            <PlaylistTableRow
              key={song.title}
              {...song.songDetails}
              onDoubleClick={(event) => handleDoubleClick(event, index)}>
              {(ourPlaylist && !isLikedSongs && !isHistorySongs) && <DeleteCheckboxTableCell checked={selected.includes(song.id)} song={song} />}
              <PlaylistTableCell songDetails={song.songDetails}>
                {song.title}
              </PlaylistTableCell>
              <PlaylistTableCell songDetails={song.songDetails} align="right">
                {song.artists}
              </PlaylistTableCell>
              <PlaylistTableCell songDetails={song.songDetails} align="right">
                {song.album}
              </PlaylistTableCell>
              <PlaylistTableCell songDetails={song.songDetails} align="right">
                {mstominsecs(song.duration)}
              </PlaylistTableCell>
              <PlaylistTableCell songDetails={song.songDetails} align="right">
                {song.added.toLocaleDateString("en-US", {year: 'numeric', month: 'long', day: 'numeric'})}
              </PlaylistTableCell>
            </PlaylistTableRow>
          ))}
        </TableBody>
    ) : (
      <TableBody checkboxSelection>
        {songList.map((song, index) => (
            <PlaylistTableRow
              key={song.title}
              {...song.songDetails}
              onDoubleClick={(event) => handleDoubleClick(event, index)}>
              {(ourPlaylist && !isLikedSongs && !isHistorySongs) && <DeleteCheckboxTableCell checked={selected.includes(song.id)} song={song} />}
              <PlaylistTableCell songDetails={song.songDetails}>
                {song.title}
              </PlaylistTableCell>
              <PlaylistTableCell songDetails={song.songDetails} align="right">
                {song.artists}
              </PlaylistTableCell>
              <PlaylistTableCell songDetails={song.songDetails} align="right">
                {song.album}
              </PlaylistTableCell>
              <PlaylistTableCell songDetails={song.songDetails} align="center">
                {mstominsecs(song.duration)}
              </PlaylistTableCell>
            </PlaylistTableRow>
          ))}
        </TableBody>
    );
  }, [isMobile, handleDoubleClick, isHistorySongs, isLikedSongs, mstominsecs, ourPlaylist, selected, songList]);

  const MemoizedTable = useMemo(() => { return !isMobile? (
    <TableContainer id="playlist_songs-table-container">
      <Table aria-label="playlist song table">
        {MemoizedTableHead}
        {MemoizedTableBody}
      </Table>
    </TableContainer>
  ) : (
    <TableContainer id="playlist_songs-table-container-small">
      <Table aria-label="playlist song table">
        {MemoizedTableHead}
        {MemoizedTableBody}
      </Table>
    </TableContainer> 
  )}, [isMobile, MemoizedTableBody, MemoizedTableHead]);

  const MemoizedBody = useMemo(() => (
    <div className="playlist_page-wrapper">
      <PlaylistContextMenu
        playSongByIndex={handleSongPlayed}
        refreshPlaylist={reloadPlaylist} />
      {MemoizedSnackBar}
      <EditPlaylistModal
        open={playlistModalState.open}
        playlist={playlist}
        copying={playlistModalState.copying}
        onClose={handleModalClose}
        onSubmit={handleSubmitEdit} 
      />  
      {!isMobile? ( 
        <div className="playlist_banner">
          <label className="playlist_img-wrapper">
            <span className="playlist_img-spacer" />
            <img
              className="playlist_img"
              src={image}
              alt={'Playlist ' + playlist.title}
            />
            {ourPlaylist && (
                <Fragment>
                  <input
                    style={{display: 'none'}}
                    id="fileImage"
                    name="fileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSubmit}
                  />
                  <AddAPhotoIcon className="playlist_upload-icon"/>
                </Fragment>
              )}
          </label>
          <div className="playlist_description">
            <p>PLAYLIST</p>
            <span className="playlist_title-header">
              <span className="playlist_name">
                {playlist.title}
              </span>
              {ourPlaylist ? (
                !isLikedSongs && <SettingsIcon
                className={"edit-playlist_settings-icon"}
                onClick={handleEditPlaylist} />
              ) : (
                <ToggleButton className="playlist_toggle-follow" id="toggle-follow-btn"
                  value='follow'
                  selected={following}
                  onChange={handleToggleFollow}
                  >
                  {following ? "Following" : "Follow"}
                </ToggleButton>
              )}
              <FileCopyIcon
              className={'edit-playlist_copy-icon'}
              onClick={() => handleCopyPlaylist(playlist)} />
            </span>
            <p><em>{playlist.description}</em></p>
            <p>{'USER ID: ' + playlist.owner_id}</p>
            {durationMs !== 0 && (
              <p>
                {`${songList.length} songs, ${msToHourMins(durationMs)}`}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="playlist-small_banner">
          <label className="playlist_img-wrapper">
            <span className="playlist_img-spacer playlist_img-spacer__small" />
            <img
              className="playlist_img"
              src={image}
              alt={'Playlist ' + playlist.title}
            />
            {ourPlaylist && (
              <Fragment>
                <input
                  style={{display: 'none'}}
                  id="fileImage"
                  name="fileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSubmit}
                />
                <AddAPhotoIcon className="playlist_upload-icon"/>
              </Fragment>
            )}
          </label>
    
          <div className="playlist-small_description">
            <p>PLAYLIST</p>
            <span className="playlist-small_title-header">
              <span className="playlist-small_name">
                {playlist.title}
              </span>
              {ourPlaylist ? (
                !isLikedSongs && <SettingsIcon
                className={"edit-playlist_settings-icon"}
                onClick={handleEditPlaylist} />
              ) : (
                <ToggleButton className="playlist_toggle-follow" id="toggle-follow-btn"
                  value='follow'
                  selected={following}
                  onChange={handleToggleFollow}
                  >
                  {following ? "Following" : "Follow"}
                </ToggleButton>
              )}
              <FileCopyIcon
              className={'edit-playlist_copy-icon'}
              onClick={() => handleCopyPlaylist(playlist)} />
            </span>
            <p><em>{playlist.description}</em></p>
            <p>{'USER ID: ' + playlist.owner_id}</p>
            {durationMs !== 0 && (
              <p>
                {`${songList.length} songs, ${msToHourMins(durationMs)}`}
              </p>
            )}
          </div>
        </div>
      )
      }
      {MemoizedTable}
    </div>
  ), [MemoizedSnackBar, MemoizedTable, durationMs, following, reloadPlaylist,
    handleEditPlaylist, handleModalClose, handleSongPlayed, handleSubmitEdit,
    handleToggleFollow, isLikedSongs, msToHourMins, ourPlaylist, playlist,
    playlistModalState.copying, playlistModalState.open, songList.length, isMobile, image, 
    handleImageSubmit],);

  return playlist.id ? (
    MemoizedBody
  ) : (
    <Redirect to="/" />
  );
}

export default PlaylistPage;
