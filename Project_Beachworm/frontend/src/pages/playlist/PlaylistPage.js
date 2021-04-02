import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { Checkbox } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { getPlaylistSongs, followPlaylist, unfollowPlaylist, deleteSongFromPlaylist } from '../../api/playlistApi';
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
import './PlaylistPage.scss';

function PlaylistPage() {
  const auth = useAuth();
  const history = useHistory();
  const spotify = useRef(useSpotifySdk());
  const { playlist: statePlaylist } = history.location.state || {};
  const [playlist, setPlaylist] = useState(statePlaylist || {});
  const [songList, setSongList] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [selected, setSelected] = useState([]);
  const [snackbarState, setSnackbarState] = useState({ open: false, message: null, severity: null });
  const ourPlaylist = playlist.owner_id === auth.id;

  const showAlert = (message, severity) => {
    setSnackbarState({
      open: true,
      message: message,
      severity: severity,
    })
  };

  const getSongs = useCallback(async () => {
    await getPlaylistSongs(playlist.id).then(data => {
      const songs = data;
      const tempList = [];
      Object.entries(songs).forEach((songKV, index) => {
        tempList.push({
          id: songKV[0],
          songId: songKV[1].song_id,
          title: songKV[1].title,
          artists: songKV[1].artists.join(', '),
          album: songKV[1].album,
          duration: songKV[1].duration_ms,
          songDetails: {
            songId: songKV[1].song_id,
            songName: songKV[1].title,
            playlistIndex: index,
          }
        });
      });
      setSongList(tempList);
      console.log('Loaded song data for playlist ' + playlist.title);
    });
  }, [playlist.id, playlist.title]);

  useEffect(() => {
    if (auth.id && playlist.id) {
      const updateFollowing = async () => {
        await getPlaylists(auth.id).then(data => {
          setFollowing(data.favorite_playlists.includes(playlist.id));
        });
      };
      
      updateFollowing();
      getSongs();
    }
  }, [auth.id, getSongs, playlist]);
  
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
      // temporary fix to deal with back-end issue with keys being indices that can change over time.
      const shiftedSelected = selected.map(x => Number(x)).map((val, ind) => (
        val - selected
          .map(x => Number(x)) // convert to numbers
          .slice(0, ind) // all items before the current index
          .filter(x => x < val) // only keep indices that will cause a shift
          .length // count them
      ));
      console.log('deleting indices', shiftedSelected);
      for (let id of shiftedSelected) { // change to selected after back-end fixed
        await deleteSongFromPlaylist(playlist.id, id).then(() => {
          console.log('Deleted playlist_song with id ' + id);
        }, () => {
          console.log('Failed to delete song ' + id);
        });
      }
      await getSongs();
      setSelected([]);
    };

    deleteSelected();
  }, [getSongs, playlist.id, selected]);

  const durationMs = songList.length ? songList.map(x => x.duration).reduce((prevSum, next) => (prevSum + next)) : 0;

  const handleEditPlaylist = useCallback(() => setEditModalOpen(true), [setEditModalOpen]);

  const handleSubmitEdit = useCallback((updatedPlaylist) => {
    setPlaylist({...playlist, ...updatedPlaylist});
  }, [playlist]);

  const handleModalClose = useCallback(() => setEditModalOpen(false), []);

  const handleHideSnackbar = useCallback(() => {
    setSnackbarState({...snackbarState, open: false});
  }, [snackbarState]);

  const handleToggleFollow = useCallback(() => {
    const toggle = async () => {
      const callback = following ? unfollowPlaylist : followPlaylist; 
      await callback(playlist.id, playlist.owner_id).then(() => {
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

  const MemoizedTableHead = useMemo(() => (
    <TableHead>
      <TableRow>
        {ourPlaylist && (
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
      </TableRow>
    </TableHead>
  ), [handleDeleteClicked, ourPlaylist]);

  const MemoizedTableBody = useMemo(() => {
    return (
      <TableBody checkboxSelection>
        {songList.map((song, index) => (
            <PlaylistTableRow
              key={song.title}
              {...song.songDetails}
              onDoubleClick={(event) => handleDoubleClick(event, index)}>
              {ourPlaylist && <DeleteCheckboxTableCell checked={selected.includes(song.id)} song={song} />}
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
            </PlaylistTableRow>
          ))}
        </TableBody>
    );
  }, [handleDoubleClick, mstominsecs, ourPlaylist, selected, songList]);

  const MemoizedTable = useMemo(() => (
    <TableContainer id="playlist_songs-table-container">
      <Table aria-label="playlist song table">
        {MemoizedTableHead}
        {MemoizedTableBody}
      </Table>
    </TableContainer>
  ), [MemoizedTableBody, MemoizedTableHead]);

  const MemoizedBody = useMemo(() => (
    <div className="playlist_page-wrapper">
      <PlaylistContextMenu
        playSongByIndex={handleSongPlayed}
        refreshPlaylist={getSongs} />
      {MemoizedSnackBar}
      <EditPlaylistModal
        open={editModalOpen}
        playlist={playlist}
        onClose={handleModalClose}
        onSubmit={handleSubmitEdit} 
      />
      <div className="playlist_banner">
        <img 
          src={DefaultImage}
          height="250px"
          width="250px"
          alt={'Playlist ' + playlist.title}
        />
        <div className="playlist_description">
          <p>PLAYLIST</p>
          <span className="playlist_title-header">
            <span className="playlist_name">
              {playlist.title}
            </span>
            {ourPlaylist ? (
              <SettingsIcon
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
      {MemoizedTable}
    </div>
  ), [MemoizedSnackBar, MemoizedTable, durationMs, editModalOpen, following, getSongs,
    handleEditPlaylist, handleModalClose, handleSongPlayed, handleSubmitEdit,
    handleToggleFollow, msToHourMins, ourPlaylist, playlist, songList.length]);

  return playlist.id ? (
    MemoizedBody
  ) : (
    <Redirect to="/" />
  );
}

export default PlaylistPage;
