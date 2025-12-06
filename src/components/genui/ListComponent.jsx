/**
 * ListComponent v9.0.0 - MUI Material Design List
 *
 * Renders bullet or numbered lists with optional descriptions.
 * Supports title, ordered/unordered lists, and item actions.
 * Now using MUI components for Material Design consistency.
 */
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import CircleIcon from '@mui/icons-material/Circle'

function ListComponent({ items, title, ordered = false, onItemClick, renderItem }) {
  if (!items || items.length === 0) {
    return (
      <Paper className="genui-list" elevation={1} sx={{ p: 3 }}>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No items available
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper className="genui-list" elevation={1} sx={{ overflow: 'hidden' }}>
      {title && (
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
      )}

      <List dense={false}>
        {items.map((item, index) => {
          const itemContent = renderItem ? (
            renderItem(item, index)
          ) : (
            <ListItemText
              primary={typeof item === 'string' ? item : item.title}
              secondary={typeof item === 'object' ? item.description : null}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          )

          const listItemContent = onItemClick ? (
            <ListItemButton onClick={() => onItemClick(item)}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {ordered ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {index + 1}.
                  </Typography>
                ) : (
                  <CircleIcon sx={{ fontSize: 8, color: 'text.secondary' }} />
                )}
              </ListItemIcon>
              {itemContent}
            </ListItemButton>
          ) : (
            <ListItem>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {ordered ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {index + 1}.
                  </Typography>
                ) : (
                  <CircleIcon sx={{ fontSize: 8, color: 'text.secondary' }} />
                )}
              </ListItemIcon>
              {itemContent}
            </ListItem>
          )

          return (
            <Box key={index}>
              {listItemContent}
              {index < items.length - 1 && <Divider variant="inset" component="li" />}
            </Box>
          )
        })}
      </List>

      {/* List summary */}
      <Divider />
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {items.length} item{items.length !== 1 ? 's' : ''} {ordered ? '(numbered)' : '(bullet)'}
        </Typography>
      </Box>
    </Paper>
  )
}

export default ListComponent
