import { useEffect, useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
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
import { useAuth } from './../../hooks/authHooks';
import { useHistory } from 'react-router-dom';
import DefaultImage from './../images/genres/placeholder.png';
import './PlaylistPage.css';

function PlaylistPage(props) {
  const auth = useAuth();
  const history = useHistory();
  const { playlist: statePlaylist } = history.location.state || {};
  const [playlist, setPlaylist] = useState(statePlaylist);
  const [songList, setSongList] = useState([]);
  
  const [following, setFollowing] = useState(false);
  const [selected, setSelected] = useState([]);

  const updateFollowing = async () => {
    await getPlaylists(auth.id).then(data => {
      setFollowing(data.favorite_playlists.includes(playlist.id));
    })
  }

  const getSongs = async () => {
    // console.log('acquiring songs');
    await getPlaylistSongs(playlist.id).then(data => {
      const songs = data;
      const tempList = [];
      Object.entries(songs).forEach(songKV =>
        tempList.push({
          id: songKV[0],
          title: songKV[1].title,
          artists: songKV[1].artists,
          album: 'under construction :)',
          duration: mstominsecs(songKV[1].duration_ms),
        }),   
      )
      setSongList(tempList);
      console.log('Loaded song data for playlist ' + playlist.title);
      // console.log(playlist)      
    })
  };
  useEffect(() => {
    if (auth.id) {
      updateFollowing();
      getSongs();
    }
  }, []);
  
  function mstominsecs(ms){
    var mins = Math.floor(ms/60000);
    var secs = ((ms % 60000) / 1000).toFixed(0);
    return mins + ":" + (secs < 10 ? '0' : '') + secs;
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
      fontSize: 30,
    },
    body: {
      color: theme.palette.common.white,
      fontSize: 20,
    },
  }))(TableCell);
  
  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }))(TableRow);

  const useStyles = makeStyles((theme) => ({
    button: {
      color: theme.palette.common.grey,
      background: theme.palette.common.white,
      backgroundColor: theme.palette.common.white,
      borderRadius: 100,
    },
  }));

  const classes = useStyles();

  return (
    <div>
      <table>
        <tr>
          <td>
            <img 
            src={DefaultImage}
            height="250px"
            width="250px"
            alt={'Playlist ' + playlist.title}></img>
          </td>
          <td>
            <table>
              <tr>
                <td style={{fontSize: '35px'}}>PLAYLIST</td>
              </tr>
              <tr>
                <td style={{fontSize: '50px'}}>{playlist.title}</td>
              </tr>
              <tr>
                <td style={{fontSize: '30px'}}>{playlist.description}</td>
              </tr>
              <tr>
                <td style={{fontSize: '30px'}}>{'USER ID: ' + playlist.owner_id}</td>
              </tr>
              <tr>
                <td style={{fontSize: '30px'}}>37 songs, 2 hours 25 minutes</td>
                <td>
                  <ToggleButton className={classes.button}
                    value='follow'
                    selected={following}
                    onChange={() => {
                      if(following){
                        unfollowPlaylist(playlist.id, playlist.owner_id);
                      } else { 
                        followPlaylist(playlist.id, playlist.owner_id);
                      }
                      setFollowing(!following);
                    }}
                    >
                    {following ? "Following" : "Follow"}
                  </ToggleButton>
                  </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <TableContainer className="tablecontainer">
        <Table aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align='left' width='1'>
                <IconButton align='left' aria-label="delete"
                  onClick={handleDeleteClicked}>
                  <DeleteIcon />
                </IconButton>
              </StyledTableCell>
              <StyledTableCell>TITLE</StyledTableCell>
              <StyledTableCell align="right">ARTIST</StyledTableCell>
              <StyledTableCell align="right">ALBUM</StyledTableCell>
              <StyledTableCell align="right">DURATION</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody checkboxSelection>
            {songList.map((song) => (
              <StyledTableRow key={song.title}>
                <Checkbox color='default' 
                checked={selected.includes(song.id)}
                onChange={(e) => {
                  if(e.target.checked){
                    setSelected([...selected, song.id]);
                  } else {
                    const index = selected.indexOf(song.id);
                    setSelected([...selected.slice(0, index), ...selected.slice(index+1)]);
                  }}
                }>
                </Checkbox>
                <StyledTableCell component="th" scope="songList" width='200'>
                  {song.title}
                </StyledTableCell>
                <StyledTableCell align="right">{song.artists}</StyledTableCell>
                <StyledTableCell align="right">{song.album}</StyledTableCell>
                <StyledTableCell align="right">{song.duration}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );

}

export default PlaylistPage;
