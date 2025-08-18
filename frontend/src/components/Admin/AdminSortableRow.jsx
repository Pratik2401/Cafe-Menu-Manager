import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Form } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { FaPencil,FaRegTrashCan, FaGripVertical } from "react-icons/fa6";

const SortableRow = ({
  sub,
  index,
  handleToggleVisibility,
  handleEditClick,
  handleDelete,
  handleViewClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sub._id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    backgroundColor: isDragging ? "#f0f0f0" : "transparent",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      data-subcategory-id={sub._id}
    >
      <td className="admin-subcategory__td admin-subcategory__td--move text-center" style={{width: '40px'}}>
        <div 
          {...attributes}
          {...listeners}
          style={{cursor: 'grab', padding: '5px'}}
          title="Drag to reorder"
        >
          <FaGripVertical />
        </div>
      </td>
      <td className="admin-subcategory__td admin-subcategory__td--name">
        {sub.name}
      </td>
      <td className="admin-subcategory__td admin-subcategory__td--count">
        {sub.count}
      </td>
      <td className="admin-subcategory__td admin-subcategory__td--gst">
        {sub.gstRate ? `${sub.gstRate}%` : 'N/A'}
      </td>
      <td className="admin-subcategory__td admin-subcategory__td--notes">
        {sub.notes && sub.notes.length > 0 ? `${sub.notes.length} note(s)` : 'No notes'}
      </td>
      <td className="admin-subcategory__td admin-subcategory__td--status">
        <Form.Check
          type="switch"
          id={`visibility-switch-${sub._id}`}
          label={sub.isVisible ? "Visible" : "Hidden"}
          checked={sub.isVisible}
          onChange={() => handleToggleVisibility(sub._id, !sub.isVisible)}
          className="admin-subcategory__visibility-switch"
        />
      </td>
      <td className="admin-subcategory__td admin-subcategory__td--actions text-center">
        <Button
          variant="outline-primary"
          size="sm"
          className="admin-subcategory__btn me-1"
          title="View"
          onClick={(e) => {
            e.stopPropagation();
            handleViewClick(sub);
          }}
          aria-label={`View ${sub.name}`}
        >
          <FaEye />
        </Button>
        <Button
          variant="outline-dark"
          size="sm"
          className="admin-subcategory__btn me-1"
          title="Edit"
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(sub);
          }}
          aria-label={`Edit ${sub.name}`}
        >
          <FaPencil />
        </Button>
        <Button
          size="sm"
          className="admin-subcategory__btn"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(sub._id);
          }}
          aria-label={`Delete ${sub.name}`}
        >
          <FaRegTrashCan />
        </Button>
      </td>
    </tr>
  );
};

export default SortableRow;