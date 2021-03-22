import { useState } from 'react';
import { Button } from '@material-ui/core';
import './TabbedGallery.css';

function TabbedGallery(props) {
  const { children: tabContent, tabDetails } = props;
  const [ selectedTabIndex, setSelectedTabIndex ] = useState(0);
  const tabKeys = Object.keys(tabDetails);

  const createTab = (key, index) => {
    return (
      <Button
      className={'tab-button' + (index === selectedTabIndex ? ' tab-button_selected' : '')}
      key={index}
      onClick={() => setSelectedTabIndex(index)}
      disableFocusRipple>
        {tabDetails[key].text}
      </Button>
    );
  }

  const createGallery = (tabKey, items) => {
    const creationCallback = tabDetails[tabKey].tabItemCreationCallback;
    return (
      <div className="gallery_row-wrapper">
        {items.length ? (
          items.map((item, index) => (
            <div className="gallery_row-item" key={index}>
              {creationCallback(item)}
            </div>
          ))
        ) : (
          <span className="gallery_empty-row-text">
            <em>
              {tabDetails[tabKey].emptyTabText}
            </em>
          </span>
        )}
      </div>  
    );
  };

  return (
    <div className="gallery_container">
      <span className="gallery_tabs">
        {tabKeys.map((key, index) => createTab(key, index))}
      </span>
      {createGallery(tabKeys[selectedTabIndex], tabContent[selectedTabIndex])}
    </div>
  );
}

export default TabbedGallery;