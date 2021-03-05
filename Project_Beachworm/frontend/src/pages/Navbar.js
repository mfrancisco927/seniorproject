function Navbar(props) {

  const { menuList, changeScreen, setSearchField, submitSearch } = props;
   
  return (

      <div className='nav-bar'>
        <ul className='nav-bar-items'>
          { menuList.map( (menuItem , index) => {
              return(
                  <li onClick={ ()=> changeScreen(index)}>  {menuItem} </li>
              )
          })}
        </ul>
        <div className='nav-bar-search-bar'>
          <form onSubmit={submitSearch}>
            <input classname='nav-bar-search-input'type='text' id='search' name='search'  placeHolder='Search' onChange={ (e) => setSearchField(e.target.value) } />
            <button class='nav-bar-search-button' type='submit'> Search </button>
          </form>
        </div>
      </div>
    )

  }

export default Navbar;