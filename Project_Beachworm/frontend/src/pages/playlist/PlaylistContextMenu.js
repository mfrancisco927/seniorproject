import { useState, useEffect, useCallback } from 'react';
import useRadioLoaders from './../../hooks/radioLoaders';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import AddToPlaylistPopover from './AddToPlaylistPopover';
import './PlaylistContextMenu.scss';

// code from 
// https://www.pluralsight.com/guides/how-to-create-a-right-click-menu-using-react
const usePlaylistContextMenu = () => {
    const [xPos, setXPos] = useState("0px");
    const [yPos, setYPos] = useState("0px");
    const [showMenu, setShowMenu] = useState(false);
    const [contextTarget, setContextTarget] = useState(null);
  
    // TODO: make original menu appear if right 
    const handleContextMenu = useCallback((e) => {
      if (e.hideCustom) {
        setShowMenu(false);
      } else {
        e.preventDefault();
        setContextTarget(e.target);
        setXPos(`${e.pageX}px`);
        setYPos(`${e.pageY}px`);
        setShowMenu(true);
      }
    }, [setXPos, setYPos]);
  
    useEffect(() => {
      document.addEventListener("contextmenu", handleContextMenu);
      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
      };
    }, [handleContextMenu]);

    const openStandardMenu = useCallback((eventTarget) => {
      const customEvent = new CustomEvent('contextmenu', { bubbles: true, cancelable: true });
      customEvent.hideCustom = true;
      eventTarget.dispatchEvent(customEvent);
    }, []);
  
    return { xPos, yPos, showMenu, setShowMenu, contextTarget, openStandardMenu };
  };

const ContextMenu = ({ menu }) => {
  const { xPos, yPos, showMenu, setShowMenu, contextTarget, openStandardMenu } = usePlaylistContextMenu();
  return (showMenu ? (
      <div className="context-menu_container"
        style={{
          position: 'absolute',
          top: yPos,
          left: xPos,
        }}>
        {menu(contextTarget, setShowMenu, openStandardMenu)}
      </div>
    ) : (
        null
    )
  );
};

const PlaylistContextMenu = (props) => {
  const { playSongByIndex, refreshPlaylist } = props;
  const [ addToPlaylistOpen, setAddToPlaylistOpen ] = useState(false);
  const [ anchorRef, setAnchorRef ] = useState(null);

  const closePopover = useCallback(() => {
    setAddToPlaylistOpen(false);
    refreshPlaylist();
  }, [refreshPlaylist])

  const loaders = useRadioLoaders();
  const spotify = useSpotifySdk();

  const addToSpotifyQueue = useCallback((song) => {
    spotify.addToUserPlayQueue([song]);
  }, [spotify]);

  return <ContextMenu menu={(target, setShowMenu, openStandardMenu) =>
    {
      const songId = target.getAttribute('songId');
      const songName = target.getAttribute('songName');
      const playlistIndex = Number(target.getAttribute('playlistIndex'));

      const handleCloseMenu = () => {
        setShowMenu(false);
      };

      const handleStartSongRadio = async (songId) => {
        loaders.loadSongRadio({id: songId, name: 'unknown'});
        handleCloseMenu(false);
      };

      const handleAddToQueue = (song) => {
        handleCloseMenu(false);
        addToSpotifyQueue(song);
      };
    
      const handlePlaylistAdd = (e) => {
        setAddToPlaylistOpen(true);
      };

      if (!songId && !playlistIndex) {
        openStandardMenu(target);
        return null;
      }

      return (
        <div className="playlist-context-menu">
          <div className="playlist-context-menu_page-wrapper"
            onClick={() => handleCloseMenu()}/>
          <AddToPlaylistPopover
            anchorEl={anchorRef}
            open={addToPlaylistOpen}
            onClose={closePopover}
            song={{id: songId, name: songName}} />
          <ul className="playlist-context-menu_list">
            <li className="playlist-context-menu_list-item"
                onClick={() => {
                  playSongByIndex(playlistIndex);
                  handleCloseMenu();
                }}>
              Play
            </li>
            <li className="playlist-context-menu_list-item"
              onClick={() => {
                handlePlaylistAdd();
              }}
              ref={el => setAnchorRef(el)}>
                Add to playlist
            </li>
            <li className="playlist-context-menu_list-item"
                onClick={() => handleAddToQueue({id: songId, name: songName})}>
              Add to queue
            </li>
          </ul>
          <ul className="playlist-context-menu_list">
            <li className="playlist-context-menu_list-item"
                onClick={() => handleStartSongRadio(songId)}>
              Play song radio
            </li>
          </ul>
        </div>
      );
    }
  }/>
}

export default PlaylistContextMenu;