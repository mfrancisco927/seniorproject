import { useHistory } from 'react-router-dom';
import { getRecommendationsByArtist, getRecommendationsByAlbum,
  getRecommendationsBySong, getRecommendationsByPlaylist,
  getRecommendationsByGenre } from '../api/recommendationApi';
import { useSpotifySdk } from './spotifyHooks';

export default function useRadioLoaders() {
  const spotify = useSpotifySdk();
  const history = useHistory();

  const loadRadioAndRedirect = (queueName, songs, loadMoreCallback, redirect) => {
    // if we have any songs, queue them up and move to the explore page
    if (songs.length) {
      console.log(`Starting radio: ${queueName}`);
      spotify.play(songs[0])
      spotify.setContextPlayQueue({
        name: queueName,
        songs: songs.slice(1),
        getMoreSongs: loadMoreCallback,
      });
      if (redirect) {
        history.push('/explore');
      }
    } else {
      console.log(`Attempted to load radio ${queueName}, but wasn't given any songs.`);
    }
  }

  // catch-all rejection for these recommendation endpoints: just return an empty list of songs
  const standardReject = (reject) => {
    console.error('Failed to retrieve more songs', reject);
    return [];
  }

  const loadSongRadio = (song, redirect=true) => {
    const getSongBasedSongs = async () => await getRecommendationsBySong(song.id).then(result => {
      result.items = [ song, ...result.items];
      return result.items;
    }, standardReject);

    getSongBasedSongs().then(songs => {
      loadRadioAndRedirect('Explore_SongRadio_' + song.name, songs, getSongBasedSongs, redirect);
    });  
  }

  const loadGenreRadio = (genre, redirect=true) => {
    const getGenreRadioSongs = async () => await getRecommendationsByGenre(genre.id).then(result => {
      return result.items;
    }, standardReject);

    getGenreRadioSongs().then(songs => {
      loadRadioAndRedirect('Explore_GenreRadio_' + genre.name, songs, getGenreRadioSongs, redirect);
    });  
  }

  const loadAlbumRadio = (album, redirect=true) => {
    const getAlbumSongs = async () => await getRecommendationsByAlbum(album.id).then(result => {
      return result.items;
    }, standardReject);
  
    getAlbumSongs().then(songs => {
      loadRadioAndRedirect('Explore_AlbumRadio_' + album.name, songs, getAlbumSongs, redirect);
    });  
  }
    
  const loadArtistRadio = (artist, redirect=true) => {
    const getArtistSongs = async () => await getRecommendationsByArtist(artist.id).then(result => {
      return result.items;
    }, standardReject);

    getArtistSongs().then(songs => {
      loadRadioAndRedirect('Explore_ArtistRadio_' + artist.name, songs, getArtistSongs, redirect);
    }); 
  }
    
  const loadPlaylistRadio = (playlist, redirect=true) => {
    const getPlaylistSongs = async () => await getRecommendationsByPlaylist(playlist.id).then(result => {
      return result.items;
    }, standardReject);

    getPlaylistSongs().then(songs => {
      loadRadioAndRedirect('Explore_PlaylistRadio_' + playlist.title, songs, getPlaylistSongs, redirect);
    }); 
  }

  return {
    loadRadioAndRedirect,
    loadSongRadio,
    loadAlbumRadio,
    loadArtistRadio,
    loadPlaylistRadio,
    loadGenreRadio,
  };
}

