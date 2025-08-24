import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminSocialCard from './AdminSocialCard';

const SortableSocialCard = ({ social, onEdit, onDelete, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: social._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Col xs={12} md={6} className="mb-4">
      <div ref={setNodeRef} style={style}>
        <AdminSocialCard
          social={social}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
          isDragging={isDragging}
          dragHandleProps={{ ...attributes, ...listeners }}
        />
      </div>
    </Col>
  );
};

const AdminSocialDragDrop = ({ socials, onReorder, onEdit, onDelete, onToggleVisibility }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = socials.findIndex(social => social._id === active.id);
      const newIndex = socials.findIndex(social => social._id === over.id);
      
      const reorderedSocials = arrayMove(socials, oldIndex, newIndex);
      onReorder(reorderedSocials);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={socials.map(social => social._id)}
        strategy={rectSortingStrategy}
      >
        <Row className="social-grid">
          {socials.map((social) => (
            <SortableSocialCard
              key={social._id}
              social={social}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </Row>
      </SortableContext>
    </DndContext>
  );
};

export default AdminSocialDragDrop;