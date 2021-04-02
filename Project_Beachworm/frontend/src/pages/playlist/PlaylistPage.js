import { useEffect, useState, useCallback, useRef } from 'react';
import { withStyles } from '@material-ui/core/styles';
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
      Object.entries(songs).forEach(songKV => {
        tempList.push({
          id: songKV[0],
          songId: songKV[1].song_id,
          title: songKV[1].title,
          artists: songKV[1].artists,
          album: 'under construction :)',
          duration: songKV[1].duration_ms,
        });
      });
      setSongList(tempList);
      console.log('Loaded song data for playlist ' + playlist.title);
    })
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

  const mstominsecs = (ms) => {
    const [, min, sec, ] = msToHourMinSecondsMillis(ms);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  }

  const msToHourMins = (ms) => {
    const [hours, min] = msToHourMinSecondsMillis(ms);
    const componentArray = [];
    if (hours) {
      componentArray.push(hours + (hours > 1 ? ' hours' : ' hour'))
    }
    if (min) {
      componentArray.push(min + ' min')
    }
    return componentArray.join(', ');
  }

  const handleDeleteClicked = async () =>{
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
  
  const StyledTableCell = withStyles((theme) => ({
    head: {
      color: theme.palette.common.white,
      fontSize: '1.25em',
    },
    body: {
      color: theme.palette.common.white,
      fontSize: '1em',
      padding: theme.spacing(0.5),
    },
  }))(TableCell);
  
  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      },
      '&:active': {
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      },
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      },
    },
  }))(TableRow);

  const durationMs = songList.length ? songList.map(x => x.duration).reduce((prevSum, next) => (prevSum + next)) : 0;

  const handleEditPlaylist = () => {
    setEditModalOpen(true);
  };

  const handleSubmitEdit = (updatedPlaylist) => {
    setPlaylist({...playlist, ...updatedPlaylist});
  }

  const handleHideSnackbar = () => {
    setSnackbarState({...snackbarState, open: false});
  }

  const handleToggleFollow = async () => {
    const callback = following ? unfollowPlaylist : followPlaylist; 
    await callback(playlist.id, playlist.owner_id).then(() => {
      showAlert(`${following ? 'Unfollowed' : 'Followed'} playlist!`, 'success');
      setFollowing(!following);
    }, () => {
      showAlert(`Error trying to ${following ? 'unfollow' : 'follow'} playlist.`, 'error');
    })
  }

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

  const DeleteCheckboxTableCell = (props) => {
    const {song} = props;
    return (
      <StyledTableCell align="center">
        <Checkbox color='default' 
        checked={selected.includes(song.id)}
        onChange={(e) => {
          if(e.target.checked){
            setSelected([...selected, song.id]);
          } else {
            const index = selected.indexOf(song.id);
            setSelected([...selected.slice(0, index), ...selected.slice(index+1)]);
          }}
        } />
      </StyledTableCell>
    )
  };

  // const [body, setBody] = useState(null);

  // useEffect(() => {
  //   setBody();
  // }, [editModalOpen, following, ourPlaylist, playlist, selected,  // eslint-disable-line react-hooks/exhaustive-deps
  //   snackbarState.message, snackbarState.open, snackbarState.severity, songList])

  return playlist.id ? (
    <div className="playlist_page-wrapper">
      <PlaylistContextMenu playSongByIndex={handleSongPlayed} />
      <Snackbar open={snackbarState.open} autoHideDuration={3000} onClose={handleHideSnackbar}>
        <MuiAlert
          onClose={handleHideSnackbar}
          severity={snackbarState.severity}
          elevation={6}
          variant="filled">
          {snackbarState.message}
        </MuiAlert>
      </Snackbar>
      <EditPlaylistModal
        open={editModalOpen}
        playlist={playlist}
        onClose={() => setEditModalOpen(false)}
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
      <TableContainer id="playlist_songs-table-container">
        <Table aria-label="playlist song table">
          <TableHead>
            <TableRow>
              {ourPlaylist && (
                <StyledTableCell align='center' width='1'>
                  <IconButton align='center' aria-label="delete"
                    onClick={handleDeleteClicked}>
                    <DeleteIcon />
                  </IconButton>
                </StyledTableCell>
              )}
              <StyledTableCell component="th" scope="col">TITLE</StyledTableCell>
              <StyledTableCell component="th" scope="col" align="right">ARTIST</StyledTableCell>
              <StyledTableCell component="th" scope="col" align="right">ALBUM</StyledTableCell>
              <StyledTableCell component="th" scope="col" align="right">DURATION</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody checkboxSelection>
            {songList.map((song, index) => {
              const songDetails = {
                songId: song.songId,
                songName: song.title,
                playlistIndex: index,
              };

              return (
                <StyledTableRow
                  className="playlist_song-row"
                  key={song.title}
                  {...songDetails}
                  onDoubleClick={() => handleSongPlayed(index)}>
                  {ourPlaylist && <DeleteCheckboxTableCell song={song} />}
                  <StyledTableCell
                  {...songDetails}>
                    {song.title}
                  </StyledTableCell>
                  <StyledTableCell
                  align="right"
                  {...songDetails}>
                    {song.artists}
                  </StyledTableCell>
                  <StyledTableCell
                  align="right"
                  {...songDetails}>
                    {song.album}
                  </StyledTableCell>
                  <StyledTableCell
                  align="right"
                  {...songDetails}>
                    {mstominsecs(song.duration)}
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  ) : (
    <Redirect to="/" />
  );
}

export default PlaylistPage;
