import { Fragment } from 'react';
import Popover from '@material-ui/core/Popover';
import { Card, CardContent, Button } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import './QueuePopover.css';
import ScrollText from './ScrollText';

const scrollProps = {
  rampMillis: 500,
  decayMillis: 500,
  speed: 20,
}

function QueuePopover(props) {
  const { 
    anchorEl, 
    currentTrack, 
    userQueue, 
    contextQueue,
    onCloseCallback,
    deleteFromUserQueue, deleteFromContextQueue,
    clearUserQueue, clearContextQueue 
  } = props;

  const queuePopoverBody = () => {
    const songList = (songs, deleteQueueCallback) => {
      const handleCallback = (index) => {
        if (deleteQueueCallback) {
          deleteQueueCallback(index);
        }
      }

      return (
        <ul className="popover-section_list">
          {songs.map((song, index) => {
            return (
              <li key={index} className="popover-section_list-item">
                <Card variant="outlined">
                  <CardContent className="card-content">
                    <div className={"card-content_text" + (deleteQueueCallback ? " card-content_text__with_control" : "")} >
                      <ScrollText className="card-content_line" {...scrollProps}>{song.name}</ScrollText>
                      <ScrollText className="card-content_line" {...scrollProps}>{'ID: ' +song.id}</ScrollText>
                    </div>
                    {deleteQueueCallback && (
                      <span className="card-content_controls">
                        <DeleteIcon onClick={() => handleCallback(index)} />
                      </span>
                    )}
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )
    };

    const songHeaderWithList = (text, list, maxSongs, deleteQueueCallback, clearQueueCallback) => {
      const truncatedList = maxSongs ? list.slice(0, Math.min(list.length, maxSongs)) : list;
      const numExtra = list.length - truncatedList.length;
      return (
        <div className="popover-section">
          <span className="popover-section_header-wrapper">
            <h4 className="popover-section_header">{text}</h4>
            {clearQueueCallback && (
              <Button onClick={() => clearQueueCallback()}
                className="btn-smaller"
                variant="outlined"
                size="small">
                  clear
              </Button>
            )}
          </span>
          {songList(truncatedList, deleteQueueCallback)}
          {!!numExtra && (
            <ScrollText className="card-content_line" {...scrollProps}>{`... and ${numExtra} more!`}</ScrollText>
          )}
        </div>
      );
    };

    const emptyLabel = () => (
      <h4>Nothing is queued!</h4>
    );

    return (
      <div className="queue-popover">
        {
          (
            currentTrack || userQueue.length || contextQueue.songs.length
          ) ? (<Fragment>
            {!!currentTrack
              && songHeaderWithList('Currently playing', [currentTrack])}
            {!!userQueue.length
              && songHeaderWithList('User queue', userQueue, 5, deleteFromUserQueue, clearUserQueue)}
            {!!contextQueue.songs.length
              && songHeaderWithList('Context queue', contextQueue.songs, 5, deleteFromContextQueue, clearContextQueue)}
          </Fragment>
          ) : emptyLabel()
        }
      </div>
    );
  }

  return (
    <Popover
      id="queue-popover"
      open={!!anchorEl}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      onClose={onCloseCallback}
      disableRestoreFocus
    >
      {queuePopoverBody()}
    </Popover>
  );
}

export default QueuePopover;