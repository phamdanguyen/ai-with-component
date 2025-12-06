/**
 * CardComponent v9.0.0 - MUI Material Design Card
 *
 * Renders cards with image, title, subtitle, content, and actions.
 * Now using MUI components for Material Design consistency.
 */
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

function CardComponent({ title, subtitle, content, image, actions }) {
  return (
    <Card className="genui-card" sx={{ maxWidth: '100%' }}>
      {image && (
        <CardMedia
          component="img"
          height="194"
          image={image}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        {content && (
          <Typography variant="body1" color="text.primary">
            {content}
          </Typography>
        )}
      </CardContent>
      {actions && actions.length > 0 && (
        <>
          <Divider />
          <CardActions sx={{ px: 2, py: 1.5 }}>
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.primary ? 'contained' : 'text'}
                color={action.primary ? 'primary' : 'inherit'}
                size="small"
              >
                {action.label}
              </Button>
            ))}
          </CardActions>
        </>
      )}
    </Card>
  )
}

export default CardComponent
