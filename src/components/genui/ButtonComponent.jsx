/**
 * ButtonComponent v9.0.0 - MUI Material Design Button
 *
 * Renders interactive buttons with various actions:
 * - open_url: Open URL in new tab
 * - call_api: Make API call
 * - navigate: Navigate to path
 * - custom: Trigger custom callback
 *
 * Now using MUI components for Material Design consistency.
 */

import { useState } from 'react'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'
import UploadIcon from '@mui/icons-material/Upload'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import StarIcon from '@mui/icons-material/Star'
import FavoriteIcon from '@mui/icons-material/Favorite'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LinkIcon from '@mui/icons-material/Link'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

// Icon mappings to MUI Icons
const ICON_MAP = {
  'arrow-right': ArrowForwardIcon,
  'arrow-left': ArrowBackIcon,
  'download': DownloadIcon,
  'upload': UploadIcon,
  'check': CheckIcon,
  'close': CloseIcon,
  'star': StarIcon,
  'heart': FavoriteIcon,
  'plus': AddIcon,
  'minus': RemoveIcon,
  'search': SearchIcon,
  'settings': SettingsIcon,
  'user': PersonIcon,
  'mail': EmailIcon,
  'phone': PhoneIcon,
  'link': LinkIcon,
  'external': OpenInNewIcon,
}

// Map variant names to MUI variants and colors
const VARIANT_MAP = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'contained', color: 'secondary' },
  success: { variant: 'contained', color: 'success' },
  danger: { variant: 'contained', color: 'error' },
  warning: { variant: 'contained', color: 'warning' },
  outline: { variant: 'outlined', color: 'primary' },
  ghost: { variant: 'text', color: 'inherit' },
}

// Size mapping
const SIZE_MAP = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
}

function ButtonComponent({
  label = 'Click',
  action = 'custom',
  actionData = {},
  variant = 'primary',
  icon = null,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false,
  onClick = null,
  className = '',
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleClick = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    setFeedback(null)

    try {
      switch (action) {
        case 'open_url':
          if (actionData.url) {
            window.open(actionData.url, actionData.target || '_blank')
            setFeedback({ type: 'success', message: 'Link opened' })
          }
          break

        case 'call_api':
          if (actionData.endpoint) {
            const response = await fetch(actionData.endpoint, {
              method: actionData.method || 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...actionData.headers
              },
              body: actionData.payload ? JSON.stringify(actionData.payload) : null
            })

            if (response.ok) {
              setFeedback({ type: 'success', message: actionData.successMessage || 'Success' })
              if (actionData.onSuccess) {
                actionData.onSuccess(await response.json())
              }
            } else {
              throw new Error('API call failed')
            }
          }
          break

        case 'navigate':
          if (actionData.path) {
            window.location.href = actionData.path
          }
          break

        case 'copy':
          if (actionData.text) {
            await navigator.clipboard.writeText(actionData.text)
            setFeedback({ type: 'success', message: 'Copied to clipboard' })
          }
          break

        case 'download':
          if (actionData.url) {
            const link = document.createElement('a')
            link.href = actionData.url
            link.download = actionData.filename || 'download'
            link.click()
            setFeedback({ type: 'success', message: 'Download started' })
          }
          break

        case 'custom':
        default:
          if (onClick) {
            await onClick(action, actionData)
          }
          break
      }
    } catch (error) {
      console.error('Button action error:', error)
      setFeedback({ type: 'error', message: actionData.errorMessage || 'Action failed' })
    } finally {
      setIsLoading(false)

      // Clear feedback after 3 seconds
      if (feedback) {
        setTimeout(() => setFeedback(null), 3000)
      }
    }
  }

  // Get MUI icon component
  const IconComponent = icon ? ICON_MAP[icon] : null

  // Get MUI variant and color
  const { variant: muiVariant, color: muiColor } = VARIANT_MAP[variant] || VARIANT_MAP.primary
  const muiSize = SIZE_MAP[size] || 'medium'

  return (
    <Box className="genui-button" sx={{ display: 'inline-block' }}>
      <LoadingButton
        variant={muiVariant}
        color={muiColor}
        size={muiSize}
        onClick={handleClick}
        disabled={disabled}
        loading={isLoading}
        loadingPosition={iconPosition === 'left' ? 'start' : 'end'}
        startIcon={!isLoading && IconComponent && iconPosition === 'left' ? <IconComponent /> : null}
        endIcon={!isLoading && IconComponent && iconPosition === 'right' ? <IconComponent /> : null}
        fullWidth={fullWidth}
        sx={{
          textTransform: 'none',
          ...(className && { className }),
        }}
      >
        {label}
      </LoadingButton>

      {/* Feedback message */}
      {feedback && (
        <Alert
          severity={feedback.type === 'success' ? 'success' : 'error'}
          sx={{ mt: 1 }}
          icon={feedback.type === 'success' ? <CheckIcon /> : <CloseIcon />}
        >
          {feedback.message}
        </Alert>
      )}
    </Box>
  )
}

export default ButtonComponent
