import { Fragment } from 'react';
import Popover from '@material-ui/core/Popover';
import { Card, CardContent } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import './QueuePopover.css';
import ScrollText from './ScrollText';

const scrollProps = {
  rampMillis: 500,
  decayMillis: 500,
  speed: 20,
}

function QueuePopover(props) {
  const { anchorEl, currentTrack, userQueue, contextQueue, onCloseCallback, deleteFromUserQueue, deleteFromContextQueue } = props;
  
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
                    <span className={"card-content_text" + (deleteQueueCallback ? " card-content_text__with_control" : "")} >
                      <ScrollText className="card-content_line" {...scrollProps}>{song.name}</ScrollText>
                      <ScrollText className="card-content_line" {...scrollProps}>{'ID: ' +song.id}</ScrollText>
                    </span>
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

    const songHeaderWithList = (text, list, deleteQueueCallback) => (
      <div className="popover-section">
        <h4 className="popover-section_header">{text}</h4>
        {songList(list, deleteQueueCallback)}
      </div>
    );

    const emptyLabel = () => (
      <h4>Nothing is queued!</h4>
    );

    return (
      <div className="queue-popover">
        {
          (
            currentTrack || userQueue.length || contextQueue.length
          ) ? (<Fragment>
            {!!currentTrack
              && songHeaderWithList('Currently playing', [currentTrack])}
            {!!userQueue.length
              && songHeaderWithList('User queue', userQueue, deleteFromUserQueue)}
            {!!contextQueue.length
              && songHeaderWithList('Context queue', contextQueue, deleteFromContextQueue)}
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