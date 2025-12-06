/**
 * Header v9.0.0 - MUI Material Design AppBar
 *
 * Navigation header with user menu dropdown.
 * Now using MUI components for Material Design consistency.
 */
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Skeleton from '@mui/material/Skeleton'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

function Header() {
  const location = useLocation()
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/demo', label: 'Demo' },
    { path: '/playground', label: 'Playground' },
    { path: '/knowledge', label: 'Knowledge' },
    { path: '/help', label: 'Help' },
    { path: '/portal', label: 'Portal' },
  ]

  // Find current tab index
  const currentTabIndex = navItems.findIndex(item => item.path === location.pathname)

  // Fetch user info on mount
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch('/superchat/api/user/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        const data = await response.json()

        if (data.success && data.is_logged_in) {
          setUserInfo(data.user)
        } else {
          setUserInfo(null)
        }
      } catch (error) {
        console.error('[Header] Failed to fetch user info:', error)
        setUserInfo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            <SmartToyIcon fontSize="small" />
          </Avatar>
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: 700,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            uniAI Super Chat
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Tabs
          value={currentTabIndex >= 0 ? currentTabIndex : false}
          sx={{
            display: { xs: 'none', md: 'flex' },
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          {navItems.map((item) => (
            <Tab
              key={item.path}
              label={item.label}
              component={Link}
              to={item.path}
            />
          ))}
        </Tabs>

        {/* Auth Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {loading ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : userInfo ? (
            /* Logged in - Show user menu */
            <>
              <Button
                onClick={handleMenuClick}
                color="inherit"
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1.5,
                }}
              >
                <Avatar
                  src={userInfo.avatar_url}
                  alt={userInfo.name}
                  sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}
                >
                  {userInfo.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography
                  variant="body2"
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    fontWeight: 500,
                  }}
                >
                  {userInfo.name}
                </Typography>
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 3,
                  sx: { minWidth: 180, mt: 1 },
                }}
              >
                <MenuItem
                  component={Link}
                  to="/portal"
                  onClick={handleMenuClose}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  My Portal
                </MenuItem>
                <Divider />
                <MenuItem
                  component="a"
                  href="/web/session/logout?redirect=/"
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* Not logged in - Show Sign In button */
            <Button
              variant="contained"
              color="primary"
              href="/web/login"
              sx={{ textTransform: 'none' }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
