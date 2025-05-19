import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material';
import { GripVertical, Eye } from 'lucide-react';

interface TicketSection {
  id: string;
  title: string;
  enabled: boolean;
  preview: string;
}

interface TicketDesignerProps {
  sections: TicketSection[];
  onChange: (sections: TicketSection[]) => void;
}

export default function TicketDesigner({ sections, onChange }: TicketDesignerProps) {
  const [items, setItems] = useState(sections);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
    onChange(newItems);
  };

  const toggleSection = (id: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Secciones del Ticket
        </Typography>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="ticket-sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {items.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ mb: 2 }}
                      >
                        <CardContent sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          opacity: section.enabled ? 1 : 0.5 
                        }}>
                          <IconButton
                            size="small"
                            {...provided.dragHandleProps}
                            sx={{ mr: 2 }}
                          >
                            <GripVertical size={20} />
                          </IconButton>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1">
                              {section.title}
                            </Typography>
                          </Box>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={section.enabled}
                                onChange={() => toggleSection(section.id)}
                              />
                            }
                            label=""
                          />
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Vista Previa</Typography>
          <IconButton sx={{ ml: 1 }}>
            <Eye size={20} />
          </IconButton>
        </Box>
        <Paper 
          sx={{ 
            p: 2, 
            width: '80mm',
            minHeight: '200mm',
            mx: 'auto',
            fontFamily: 'monospace',
            fontSize: '10pt'
          }}
        >
          {items
            .filter(section => section.enabled)
            .map((section, index) => (
              <React.Fragment key={section.id}>
                {index > 0 && <Divider sx={{ my: 1 }} />}
                <Box sx={{ whiteSpace: 'pre-wrap' }}>
                  {section.preview}
                </Box>
              </React.Fragment>
            ))}
        </Paper>
      </Box>
    </Box>
  );
}