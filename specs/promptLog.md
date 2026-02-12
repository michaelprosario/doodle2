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