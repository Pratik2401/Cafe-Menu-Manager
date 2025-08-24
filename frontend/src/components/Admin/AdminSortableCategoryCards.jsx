import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Button, Form } from "react-bootstrap";
import { FiX, FiCheck, FiMove } from "react-icons/fi";
import Switch from "react-switch";
import { FaEye } from "react-icons/fa";
import { FaPencil,FaRegTrashCan } from "react-icons/fa6";
import { getImageUrl } from '../../utils/imageUrl';


const SortableCategoryCard = ({
  category,
  index,
  editingCategoryId,
  editedCategory,
  fileInputRef,
  onEditTitleChange,
  onImageUpload,
  onChangeImageClick,
  onFileInputChange,
  onCancelEdit,
  onSaveEdit,
  onEditClick,
  onDeleteClick,
  onToggleShow,
  onView
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category._id });  // use _id here

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative", // for absolute drag handle positioning
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="CategoryCard" style={{ height: '100%' }}>
        {/* Drag handle icon */}
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: "grab",
            padding: 10,
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            userSelect: "none",
            touchAction: "none",
          }}
          aria-label="Drag handle"
        >
          <FiMove size={18} />
        </div>

        {editingCategoryId === category._id ? (
          <Card.Body>
            <Form.Group
              controlId={`editTitle-${category._id}`}
              className="TitleFormGroup"
            >
              <Form.Label className="TitleFormLabel">Title:</Form.Label>
              <Form.Control
                type="text"
                value={editedCategory.name}  // changed from title
                onChange={(e) => onEditTitleChange({...editedCategory, name: e.target.value})}
                className="TitleFormField"
              />
            </Form.Group>

            <div className="CategoryCard-ImageContainer mt-3 mb-2">
              <Card.Img
  variant="top"
  src={
    editedCategory.preview ? 
      editedCategory.preview : 
      (editedCategory.image ? 
        (typeof editedCategory.image === 'string' ? getImageUrl(editedCategory.image) : editedCategory.image) : 
        getImageUrl(category.image)
      )
  }
  className="CategoryCard-Image"
/>
            </div>

            <Form.Group
              controlId={`editImage-${category._id}`}
              className="EdtChangeImage"
            >
              <Form.Label
                className="CategoryCard-ChangeImageButton"
                style={{ cursor: "pointer" }}
                onClick={onChangeImageClick}
              >
                Change Image
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                style={{ display: "none" }}
                ref={(ref) => {
                  if (fileInputRef) {
                    if (typeof fileInputRef === 'function') {
                      fileInputRef(ref);
                    } else {
                      fileInputRef.current = ref;
                    }
                  }
                }}
              />
            </Form.Group>
            
            <Form.Group className="mt-3">
              <Form.Check
                type="switch"
                id={`age-restriction-switch-${category._id}`}
                label="Age Restricted (21+)"
                checked={editedCategory.isAgeRestricted || false}
                onChange={(e) => onEditTitleChange({ ...editedCategory, isAgeRestricted: e.target.checked })}
              />
            </Form.Group>

            <div className="EditBottomBtn d-flex gap-2 justify-content-center">
              <Button className="EditCancelBtn" size="sm" onClick={onCancelEdit}>
                <FiX className="me-1" />
                Cancel
              </Button>
              <Button className="EditSaveBtn" size="sm" onClick={onSaveEdit}>
                <FiCheck className="me-1" />
                Save
              </Button>
            </div>
          </Card.Body>
        ) : (
          <>
            <Card.Title className="CategoryCard-Title">
              Title : {category.name}  {/* changed from title */}
         
            </Card.Title>

            <div className="CategoryCard-ImageContainer">
              <Card.Img
                variant="top"
                src={getImageUrl(category.image)} 
                className="CategoryCard-Image"
              />
            </div>

            <div className="CategoryCard-BottomRow">
             <div className="CategoryCard-ActionIcons">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={onView}
            className="CategoryCard-IconButton ViewBtn"
            style={{
              transition: "color 0.3s",
            }}
            onMouseOver={(e) => e.currentTarget.querySelector('svg').style.color = "#658AD8"}
            onMouseOut={(e) => e.currentTarget.querySelector('svg').style.color = ""}
          >
            <FaEye size={17} />
          </Button>
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={onEditClick}
                  className="CategoryCard-IconButton EditBtn"
                  style={{
                    transition: "color 0.3s",
                  }}
                  onMouseOver={(e) => e.currentTarget.querySelector('svg').style.color = "#000000"}
                  onMouseOut={(e) => e.currentTarget.querySelector('svg').style.color = ""}
                >
                  <FaPencil size={17}/>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={onDeleteClick}
                  className="CategoryCard-IconButton DelBtn"
                  style={{
                    transition: "color 0.3s",
                  }}
                  onMouseOver={(e) => e.currentTarget.querySelector('svg').style.color = "#F60002"}
                  onMouseOut={(e) => e.currentTarget.querySelector('svg').style.color = ""}
                >
                  <FaRegTrashCan size={17} />
                </Button>
              </div>

        <div className="CategoryCard-ToggleWrapper">
          <Switch
            checked={!!category.isVisible}
            onChange={() => onToggleShow(category._id, !!category.isVisible)}
            onColor="#64E239"
            offColor="#545454"
            checkedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Show</span>}
            uncheckedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Hide</span>}
            width={70}
            height={30}
            handleDiameter={22}
          />
        </div>


            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default SortableCategoryCard;
