import { useHistory } from 'react-router-dom';
import { getRecommendationsByArtist, getRecommendationsByAlbum,
  getRecommendationsBySong, getRecommendationsByPlaylist,
  getRecommendationsByGenre } from '../api/recommendationApi';
import { useSpotifySdk } from './spotifyHooks';

export default function useRadioLoaders() {
  const spotify = useSpotifySdk();
  const history = useHistory();

  const loadRadioAndRedirect = (queueName, songs, loadMoreCallback) => {
    // if we have any songs, queue them up and move to the explore page
    if (songs.length) {
      spotify.play(songs[0].id)
      spotify.setContextPlayQueue({
        name: queueName,
        songs: songs.slice(1),
        getMoreSongs: loadMoreCallback,
      });
      history.push('/explore');
    }
  }

  // catch-all rejection for these recommendation endpoints: just return an empty list of songs
  const standardReject = (reject) => {
    console.error('Failed to retrieve more songs', reject);
    return [];
  }

  const loadSongRadio = (song) => {
    const getSongBasedSongs = async () => await getRecommendationsBySong(song.id).then(result => {
      return result.items;
    }, standardReject);

    getSongBasedSongs().then(songs => {
      loadRadioAndRedirect('Explore_SongRadio_' + song.name, songs, getSongBasedSongs);
    });  
  }

  const loadGenreRadio = (genre) => {
    const getGenreRadioSongs = async () => await getRecommendationsByGenre(genre.id).then(result => {
      return result.items;
    }, standardReject);

    getGenreRadioSongs().then(songs => {
      loadRadioAndRedirect('Explore_GenreRadio_' + genre.name, songs, getGenreRadioSongs);
    });  
  }

  const loadAlbumRadio = (album) => {
    const getAlbumSongs = async () => await getRecommendationsByAlbum(album.id).then(result => {
      return result.items;
    }, standardReject);
  
    getAlbumSongs().then(songs => {
      loadRadioAndRedirect('Explore_AlbumRadio_' + album.name, songs, getAlbumSongs);
    });  
  }
    
  const loadArtistRadio = (artist) => {
    const getArtistSongs = async () => await getRecommendationsByArtist(artist.id).then(result => {
      return result.items;
    }, standardReject);

    getArtistSongs().then(songs => {
      loadRadioAndRedirect('Explore_ArtistRadio_' + artist.name, songs, getArtistSongs);
    }); 
  }
    
  const loadPlaylistRadio = (playlist) => {
    const getPlaylistSongs = async () => await getRecommendationsByPlaylist(playlist.id).then(result => {
      return result.items;
    }, standardReject);

    getPlaylistSongs().then(songs => {
      loadRadioAndRedirect('Explore_PlaylistRadio_' + playlist.title, songs, getPlaylistSongs);
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

