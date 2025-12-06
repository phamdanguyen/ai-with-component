/**
 * FormComponent v9.0.0 - MUI Material Design Form
 *
 * Renders dynamic forms with various field types:
 * - text, email, tel, password, number, date
 * - textarea, select, checkbox, radio
 *
 * Features:
 * - Field validation (required, email, pattern)
 * - Submit actions (call_api, custom)
 * - Loading state and feedback
 * - Responsive layout with MUI Grid
 *
 * Now using MUI components for Material Design consistency.
 */

import { useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import Checkbox from '@mui/material/Checkbox'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import LoadingButton from '@mui/lab/LoadingButton'
import SendIcon from '@mui/icons-material/Send'

// Field type to input type mapping
const FIELD_TYPE_MAP = {
  text: 'text',
  email: 'email',
  tel: 'tel',
  phone: 'tel',
  password: 'password',
  number: 'number',
  date: 'date',
  datetime: 'datetime-local',
  time: 'time',
  url: 'url',
}

function FormComponent({
  title = 'Form',
  description = '',
  fields = [],
  submitLabel = 'Submit',
  submitAction = 'custom',
  submitData = {},
  onSubmit = null,
  layout = 'vertical', // vertical | horizontal | grid
  columns = 1,
}) {
  const [formData, setFormData] = useState(() => {
    // Initialize with default values
    const initial = {}
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue
      } else if (field.type === 'checkbox') {
        initial[field.name] = false
      } else {
        initial[field.name] = ''
      }
    })
    return initial
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    // Clear error when user makes changes
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }))
    }
    // Clear feedback
    if (feedback) {
      setFeedback(null)
    }
  }

  const validateField = (field, value) => {
    // Required validation
    if (field.required) {
      if (value === '' || value === null || value === undefined) {
        return `${field.label} is required`
      }
      if (field.type === 'checkbox' && !value) {
        return `${field.label} must be checked`
      }
    }

    // Skip further validation if empty and not required
    if (!value) return null

    // Email validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Invalid email format'
      }
    }

    // Tel/Phone validation
    if (field.type === 'tel' || field.type === 'phone') {
      const phoneRegex = /^[\d\s\-+()]{8,}$/
      if (!phoneRegex.test(value)) {
        return 'Invalid phone number'
      }
    }

    // URL validation
    if (field.type === 'url') {
      try {
        new URL(value)
      } catch {
        return 'Invalid URL format'
      }
    }

    // Pattern validation
    if (field.pattern) {
      const regex = new RegExp(field.pattern)
      if (!regex.test(value)) {
        return field.patternMessage || 'Invalid format'
      }
    }

    // Min/Max length
    if (field.minLength && value.length < field.minLength) {
      return `Minimum ${field.minLength} characters required`
    }
    if (field.maxLength && value.length > field.maxLength) {
      return `Maximum ${field.maxLength} characters allowed`
    }

    // Min/Max value for numbers
    if (field.type === 'number') {
      const numValue = parseFloat(value)
      if (field.min !== undefined && numValue < field.min) {
        return `Minimum value is ${field.min}`
      }
      if (field.max !== undefined && numValue > field.max) {
        return `Maximum value is ${field.max}`
      }
    }

    return null
  }

  const validateForm = () => {
    const newErrors = {}
    fields.forEach(field => {
      const error = validateField(field, formData[field.name])
      if (error) {
        newErrors[field.name] = error
      }
    })
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setFeedback(null)

    try {
      switch (submitAction) {
        case 'call_api':
          if (submitData.endpoint) {
            const response = await fetch(submitData.endpoint, {
              method: submitData.method || 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...submitData.headers
              },
              body: JSON.stringify(formData)
            })

            if (response.ok) {
              setFeedback({
                type: 'success',
                message: submitData.successMessage || 'Form submitted successfully'
              })

              // Clear form if specified
              if (submitData.clearOnSuccess) {
                setFormData({})
              }
            } else {
              throw new Error('API call failed')
            }
          }
          break

        case 'custom':
        default:
          if (onSubmit) {
            await onSubmit(formData)
            setFeedback({
              type: 'success',
              message: 'Form submitted successfully'
            })
          }
          break
      }
    } catch (error) {
      console.error('Form submit error:', error)
      setFeedback({
        type: 'error',
        message: submitData.errorMessage || 'Failed to submit form'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderField = (field) => {
    const value = formData[field.name]
    const error = errors[field.name]
    const inputType = FIELD_TYPE_MAP[field.type] || 'text'

    switch (field.type) {
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={field.rows || 4}
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isLoading}
            error={!!error}
            helperText={error || field.helpText}
            label={field.label}
            required={field.required}
          />
        )

      case 'select':
        return (
          <FormControl fullWidth error={!!error}>
            <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
            <Select
              labelId={`${field.name}-label`}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={isLoading}
              label={field.label}
            >
              <MenuItem value="">
                <em>Select {field.label}</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || field.helpText) && (
              <FormHelperText>{error || field.helpText}</FormHelperText>
            )}
          </FormControl>
        )

      case 'checkbox':
        return (
          <FormControl error={!!error}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!value}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  disabled={isLoading}
                  color="primary"
                />
              }
              label={field.checkboxLabel || field.label}
            />
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        )

      case 'radio':
        return (
          <FormControl error={!!error}>
            <FormLabel id={`${field.name}-label`}>{field.label}</FormLabel>
            <RadioGroup
              aria-labelledby={`${field.name}-label`}
              name={field.name}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio disabled={isLoading} />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        )

      default:
        return (
          <TextField
            fullWidth
            type={inputType}
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isLoading}
            error={!!error}
            helperText={error || field.helpText}
            label={field.label}
            required={field.required}
            inputProps={{
              min: field.min,
              max: field.max,
              minLength: field.minLength,
              maxLength: field.maxLength,
            }}
          />
        )
    }
  }

  // Grid columns
  const gridColumns = layout === 'grid' ? Math.min(columns, 4) : 1

  return (
    <Paper className="genui-form" elevation={1} sx={{ p: 3 }}>
      {/* Header */}
      {(title || description) && (
        <Box sx={{ mb: 3 }}>
          {title && (
            <Typography variant="h5" component="h3" gutterBottom>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={12} sm={gridColumns > 1 ? 12 / gridColumns : 12} key={field.name}>
              {renderField(field)}
            </Grid>
          ))}
        </Grid>

        {/* Submit button */}
        <Box sx={{ mt: 3 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            loading={isLoading}
            loadingPosition="end"
            endIcon={<SendIcon />}
          >
            {submitLabel}
          </LoadingButton>
        </Box>
      </form>

      {/* Feedback message */}
      {feedback && (
        <Alert
          severity={feedback.type === 'success' ? 'success' : 'error'}
          sx={{ mt: 2 }}
        >
          {feedback.message}
        </Alert>
      )}
    </Paper>
  )
}

export default FormComponent
