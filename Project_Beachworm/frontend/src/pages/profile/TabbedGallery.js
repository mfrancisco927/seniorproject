import { useState } from 'react';
import { Button } from '@material-ui/core';
import './TabbedGallery.css';

function TabbedGallery(props) {
  const { children: tabContent, tabItemCreationCallbacks } = props;
  const [ selectedTabIndex, setSelectedTabIndex ] = useState(0);
  const tabNames = Object.keys(tabItemCreationCallbacks);

  const createTab = (name, index) => {
    return (
      <Button className="tab-button" key={index} onClick={() => setSelectedTabIndex(index)}>
        {name}
      </Button>
    );
  }

  const createGallery = (tabName, items) => {
    const creationCallback = tabItemCreationCallbacks[tabName];
    return (
      <div className="gallery_row-wrapper">
        {
          items.map((item, index) => (
            <div className="gallery_row-item" key={index}>
              {creationCallback(item)}
            </div>
          ))
        }
      </div>  
    );
  };

  return (
    <div className="gallery_container">
      <span className="gallery_tabs">
        {tabNames.map((name, index) => createTab(name, index))}
      </span>
      {createGallery(tabNames[selectedTabIndex], tabContent[selectedTabIndex])}
    </div>
  );
}

export default TabbedGallery;