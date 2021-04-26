import { Button } from '@material-ui/core';
import './TabbedGallery.scss';

function TabbedGallery(props) {
  const { children: tabContent, tabDetails, selectedTabIndex, setSelectedTabIndex } = props;
  const tabKeys = Object.keys(tabDetails);

  const createTab = (key, index) => {
    return (
      <Button
      className={'tab-button' + (index === selectedTabIndex ? ' tab-button__selected' : '')}
      key={index}
      onClick={() => setSelectedTabIndex(index)}
      disableFocusRipple>
        {tabDetails[key].text}
      </Button>
    );
  }

  const createGallery = (tabKey, items) => {
    const { tabItemCreationCallback: creationCallback, prependItems } = tabDetails[tabKey];

    const prependItemsWrapped = prependItems ? prependItems.map((item, index) => (
      <div className="gallery_row-item" key={'prepend' + index}>
        {item}
      </div>
    )) : [];

    const mainItemsWrapped = items.length ? items.map((item, index) => (
      <div className="gallery_row-item" key={'main' + index}>
        {creationCallback(item)}
      </div>
    )) : [];

    const allItems = [...prependItemsWrapped, ...mainItemsWrapped];

    return (
      <div className="gallery_row-wrapper">
        {allItems.length ? (
          allItems
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