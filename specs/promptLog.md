2/11

- read specs/epic1_projectCreation.md
- Think about the approach for epic 1 and Project Creation & Management
- Think about implementing in the angular project doodle
- Document in epic1_projectCreation_tasks1.md

===

- read specs/expandedRequirements.md
- Think about the approach for epic 2
- Think about implementing in the angular project doodle
- Document task design in epic2_tasks1.md


====

- read specs/expandedRequirements.md
- Think about the approach for epic 3
- Think about implementing in the angular project doodle
- Document task design in epic3_tasks1.md

===

unfortunately, adding a frame does not seem to do anything.
Enable me to add a frame properly to a scene.

====

As a user, I should be able to draw on the canvas using a pen tool.  At present, no drawing tools seem to work.

====
drawing on canvas do not work.

2/12
- write a document about the tech design of this app
- outline principles leveraged
- outline major services
- outline major components
- document in techDesign.md


====

- Think about /workspaces/doodle2/specs/expandedRequirements.md.
- Focus on planning epic 4
- Document tasks for epic 4 in specs/ElementSelectionTasks.md


====

Execute specs/ElementSelectionTasks.md

===

As a canvas drawer, I would like to have more screen area for drawing.  Refactor the UI so that scene management is performed in a modal screen.

===

As a canvas drawer, I would like to have more screen area for drawing.  Refactor the UI so that the color and stroke picker can be collapsed to the side.

==== 

Given
- I am actively drawing on a valid canvas
- I have drawn a rectangle on the canvas
- I have the select tool active
- I have selected the rectangle

When I press DELETE

Then the system should delete the selected object from the canvas.

====

Remove the following tools from the canvas tool box:
- polygon
- star
- triangle

====

As a canvas drawer, I should be able to undo the last draw action using CTRL+Z.

====

2/15
### given
- i am using the scene list screen
### when

- i have clicked the delete button on an existing scene

### then
- the system showed me the delete modal
- the content of the model is largely blank

### Given
- I am drawing on the canvas using rectangle tool
- I created a rectangle
- I have select tool engaged

### When
- I drag an object on the canvas using the select tool

### Then
- The system should visualize the movement of the object 

====

Remove the circle tool from tools.

=====

Remove Pen tool from tools.


====

As a canvas drawer, I should be able to use the eye dropper tool

### given
- I a have an active canvas
- I have draw a red box on the canvas
- I have the eye dropper tool active

### when
- I hover my mouse over a red thing
- I click my mouse

### then
- The system should inspect the pixel location of the mouse
- The system should extract the color at the pixel location
- The system should set the stroke color to the extracted color.
