# Wiki

## Finding Center of Mass

To find the center of mass, one must find the exterior vertices

## Listing all vertices

Given a list of modules, one must filter repeated coodinates

the diagram

```
         _______ 
        |       |
        |  0, 1 |
 _______|_______|_______ 
|       |       |       |
| -1, 0 |  0, 0 |  1, 0 |
|_______|_______|_______|
        |       |
        |  0,-1 |
        |_______|
```

and the code

```
let [vertex array]
let [repeated]

func compute vertices | coord x4:
	(top    left: x, y) | (top    right: x, y) |
	(bottom left: x, y) | (bottom right: x, y)
	
	add coord to [vertex array] if (coord doesn't exists in [vertex array])
	else return "coord exists" and add to [repeated] and return [repeated] length

start
	lowest x: -1
		lowest y:  0
			compute vertices:
				(-1.5, 0.5) | (-0.5, 0.5) |
				(-1.5,-0.5) | (-0.5,-0.5)
				0
		next y: none
	next x:  0
		lowest y: -1
			compute vertices:
				(-0.5,-0.5) | ( 0.5,-0.5) |
				(-0.5,-1.5) | ( 0.5,-1.5)
				top left exists
				1
		next y:  0
			compute vertices:
				(-0.5, 0.5) | ( 0.5, 0.5) |
				(-0.5,-0.5) | ( 0.5,-0.5)
				top left | bottom left | bottom right exists
				4
		next y:  1
			compute vertices:
				(-0.5, 1.5) | ( 0.5, 1.5) |
				(-0.5,-0.5) | ( 0.5, 0.5)
				bottom left | bottom right exists
				6
		next y: none
	next x:  1
		lowest y:  0
			compute vertices:
				( 0.5, 0.5) | ( 1.5, 0.5) |
				( 0.5,-0.5) | ( 1.5,-0.5)
				top left | bottom left exists
				8
	next x: none
end
```

# for triangle coordinates

loop through diagram's coordinates in order of x, y, z

```
                __ ______________ __
               /  \              /  \
              /    \            /    \
             /      \  1,-1, 1 /      \
            /        \        /        \
           /  0,-1, 1 \      /  1,-1, 0 \
          /            \    /            \
       __/______________\__/______________\__
      /  \              /  \              /  \
     /    \            /    \            /    \
    /      \  0, 0, 1 /      \  1, 0, 0 /      \
   /        \        /        \        /        \
  / -1, 0, 1 \      /  0, 0, 0 \      /  1, 0,-1 \
 /            \    /            \    /            \
/______________\__/______________\__/______________\
\              /  \              /  \              /
 \            /    \            /    \            /
  \ -1, 1, 1 /      \  0, 1, 0 /      \  1, 1,-1 /
   \        /        \        /        \        /
    \      / -1, 1, 0 \      /  0, 1,-1 \      /
     \    /            \    /            \    /
      \__/______________\__/______________\__/
```

program

```
[vertex array]
[repeated]
compute vertices | coord x3:
	(top center: x, y, z) |
	(bottom left: x, y, z) | (bottom right: x, y, z)
	or
	(top left: x, y, z) | (top right: x, y, z) |
	(bottom center: x, y, z)
	
	add coord to [vertex array] if (coord doesn't exists in [vertex array])
	else return (coord" exists") and add to [repeated] and return [repeated] length

start
	loop x: -1
		loop y:  0
			loop z:  1
				compute_vertices:
					(-1  B, 1  H) |
					(-1.5B,-0.5H) | (-0.5B,-0.5H)
					0
			next z:  none
		next y:  1
			loop z:  0
				compute_vertices:
					(-0.5B,-0.5H) |
					(-1  B,-1.5H) | ( 0  B,-1.5H)
					top center exists
					1
			next z:  1
				compute_vertices:
					(-1.5B,-0.5H) | (-0.5B,-0.5H) |
					(-1  B,-1.5H)
					top left, top right, bottom center exists
					4
			next z:  none
		next y:  none
	next x:  0
		loop y: -1
			loop z:  1
				compute_vertices:
					(-0.5B, 1.5H) |
					(-1  B, 0.5H) | ( 0  B, 0.5H)
					bottom left exists
					5
			next z:  none
		next y:  0
			loop z:  0
				compute_vertices:
					( 0  B, 0.5H) |
					(-0.5B,-0.5H) | ( 0.5B,-0.5H)
					top center, bottom left exists
					7
			next z:  1
				compute_vertices:
					(-1  B, 0.5H) | ( 0  B, 0.5H) |
					(-0.5B,-0.5H)
					top left, top right, bottom center exists
					10
			next z:  none
		next y:  1
			loop z: -1
				compute_vertices:
					( 0.5B,-0.5H) |
					( 0  B,-1.5H) | ( 1  B,-1.5H)
					top center, bottom left exists
					12
			next z:  0
				compute_vertices:
					(-0.5B,-0.5H) | ( 0.5B,-0.5H)
					( 0  B,-1.5H)
					top left, top right, bottom center exists
					15
			next z:  none
		next y:  none
	next x:  1
		loop y: -1
			loop z:  0
				compute_vertices:
					( 0.5B, 1.5H) |
					( 0  B, 0.5H) | ( 1  B, 0.5H)
					bottom left exists
					16
			next z:  1
				compute_vertices:
					(-0.5B, 1.5H) | (0.5B, 1.5H) |
					( 0  B, 0.5H)
					top left, top right, bottom center exists
					19
			next z:  none
		next y:  0
			loop z: -1
				compute_vertices:
					( 1  B, 0.5H) |
					( 0.5B,-0.5H) | ( 1.5B,-0.5H)
					top center, bottom left exists
					21
			next z:  0
				compute_vertices:
					( 0  B, 0.5H) | ( 1  B, 0.5H) |
					( 0.5B,-0.5H)
					top left, top right, bottom center exists
					24
			next z:  none
		next y: 1
			next z: -1
				compute_vertices:
					( 0.5B,-0.5H) | ( 1.5B,-0.5H) |
					( 1  B,-1.5H)
					top left, top right, bottom center exists
					27
			next z:  none
		next y:  none
	next x:  none
end
[vertex array] length is 21
[repeated] length is 27
```

## problem with using vertices to calculate center of mass
using the previous example, if (1,0,0) were to not exist, the center of mass would change, yet the vertices of the triangle would be counted anyways

### solution 1?
maybe using the vertices to calculate the center of mass was a bad idea from the beggining.

instead calculate the center of mass of every triangle (conveniently this is the center and therefore can be given with it's coordinates to square), and then calculate the mass of the construct given the center of masses.

this method calculates the center of mass through iteration

### solution 2?
construct polygons (much like svg polygons) given the concave hull, and find center of mass with entire polygon.

this method I'm still not sure how to implement, but requires a lot of math to find the polygon and to find the center of mass given the polygon.

## so

solution 1 is simpler, but solution 2 might be more performant. First implement solution 1, then worry about the rest.

$$tau_z = r_x \cdot F_y - r_y \cdot F_x$$


d:
```
      _ ___________ _
     / \           / \
    /   \         /   \
   /     \       /     \
  /       \  0  /       \
 /      5  \   /  2      \
/___________\_/___________\
\           / \           /
 \      3  /   \  4      /
  \       /  1  \       /
   \     /       \     /
    \   /         \   /
     \_/___________\_/
```

0: ($0$ , $1$)  
1: ($1$ , $0$)  
2: ($+0.5$ , $+0.5\sqrt{3}$)  
3: ($-0.5$ , $-0.5\sqrt{3}$)  
4: ($+0.5$ , $-0.5\sqrt{3}$)  
5: ($-0.5$ , $+0.5\sqrt{3}$)	



Instead of for every module added add to physiscs, first load the meta, then load the physics
```
universe
	modules
	users
		spaceships
			capsules
				list of ids
			modules
				object, id: meta
			constraints
				object, id: meta
			
			composite <- matterJS
				bodies
					body1
						meta
							id
				constraints
					constraint1
						meta
							id
```

scientist 