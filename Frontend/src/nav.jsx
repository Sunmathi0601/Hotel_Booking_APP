import { Link, NavLink } from 'react-router-dom'
import './nav.css'
const Nav = ({ theme, onToggleTheme }) => {
  return (
    <div className="nav-shell">
        <nav>
        <h1>
          ──◈DREAMORA🌙──<br></br>
          <span className="nav-subtitle">Hotels🏡&amp; Resorts🏝️</span>
          </h1>

        <ul>
           <li><Link to="/">HOME🏡</Link></li>
          <li><Link className="nav-add-hotel" to="/add-hotel">ADD HOTEL +</Link></li>
          <li>
            <button
              className="theme-toggle"
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              aria-pressed={theme === 'dark'}
              onClick={onToggleTheme}
            >
              <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
              <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </li>
          <li><NavLink className="nav-help-link" to="/help">HELP</NavLink></li>
        </ul>
      </nav>
      
    </div>
  )
}

export default Nav
