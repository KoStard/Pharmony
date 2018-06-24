# Pharmony
To start this use npm (Node package manager). This projects uses Electron from Github.
## What you can do with Pharmony?
1. Take notes when studying.
2. Learn with much higher efficacy, because with Pharmony if you take notes of some rare/hard information, then you won't forget that.
2. Search in your notes and get fast access to current blocks.
3. Export your notes to docx, print and review your notes before exams.

Spend some time and try to understand how to use this and you'll get great studying tool.

**Available commands**
1. Add/edit block - `[block name] -- [description]`
for example - `amoxiclav -- amoxicillin + clavulanic acid`
2. Remove block - `[block name] --/`
3. Rename block - `[block name] --> [new name]`
4. Add to the block's description - `[block name] --+ [some new comments]`
5. Remove from the block's description - `[block name] --- [some comments to remove]`.

2-5 commands can be run on multiple elements with `*`
When using `*` after the `[block name]`, the program will search with that `[block name]` and do the command on all results.
For example if we have
`1. test1 -- some comments1
2. test2 -- some comments2
3. test3 -- some comments3`
And we run `test* --+ added comments`, then we'll get this result.
`1. test1 -- some comments1; added comments
2. test2 -- some comments2; added comments
3. test3 -- some comments3; added comments`
In the table `;`'s will be shown as multiple lines.
`test1 - 1. some comments1
         2. added comments`
         
Pharmony provides nice searching ability too.
You can use these characters to find more correctly.
`[A]&[B]` - if you want both A and B be in the result. For example `am&cillin` will give you some results which will contain `ampicillin`, because it contains both `am` and `cillin`.
`[A]^[B]` - if you want A to be in result and B **not** to be in the result. You can use `!` instead of `^` too.
`[A]|[B]` - if you want at least A or B to be in the result. 
All these searching tips can be used with commands to edit/remove multiple elements using `*`.

After all this, you can even export to the docx file in two modes by settings button
1. Standart export - when only block names appear in the document
2. Full export - when both the block name and description appear in the document
3. Selective export - does full export of blocks which have description.

Just use `npm start` to run the program. When running first time, you have to remove the `node_modules` folder and run `npm install` to let the program normally start (electron's main image can't be passed through github).
Now as you see I have added some temp collections and now we'll add one together.
<img width="912" alt="screen shot 2018-06-20 at 12 31 38" src="https://user-images.githubusercontent.com/30292877/41647145-9b8162f0-7486-11e8-96d3-9e519022d703.png">
Click the bottom **New collection** button.
<img width="912" alt="screen shot 2018-06-20 at 12 31 43" src="https://user-images.githubusercontent.com/30292877/41647407-5765dd0c-7487-11e8-9b4b-61e1ccca4c5d.png">
You see popup window asking to write the name of new collection. Enter it and press **Done**.
<img width="912" alt="screen shot 2018-06-20 at 12 16 14" src="https://user-images.githubusercontent.com/30292877/41648414-dd9437e6-7489-11e8-8409-7431d680c6af.png">
Click on the appeared button with your collection name.
<img width="912" alt="screen shot 2018-06-20 at 12 23 43" src="https://user-images.githubusercontent.com/30292877/41648463-0480a768-748a-11e8-9972-e17cc18fcc2c.png">
You'll see top panel with input bar and 2 buttons (from left to right - details mode button and settings button).
Write in the input bar with this template to create new block.
1. Raw description - `[block name] -- [description]`.
2. Pointed description - `[block name] -- [description point; description point; description point]`.
<img width="912" alt="screen shot 2018-06-20 at 12 20 56" src="https://user-images.githubusercontent.com/30292877/41648697-ae9f1b58-748a-11e8-9a0c-d8c481697fd3.png">
Here you can press **enter** and add new block. But here I want to show you the first button - details mode button.
<img width="912" alt="screen shot 2018-06-20 at 12 21 07" src="https://user-images.githubusercontent.com/30292877/41648760-e2d1e22a-748a-11e8-8448-d5c1e8e998de.png">
Press it and you'll see the details mode with the content entered in the input bar earlier.
<img width="912" alt="screen shot 2018-06-20 at 12 21 10" src="https://user-images.githubusercontent.com/30292877/41648840-13a29dea-748b-11e8-9402-42fcedbf8417.png">
And here edit and press **Done**.
Done! You added new block in the Pharmony.
<img width="912" alt="screen shot 2018-06-20 at 12 21 34" src="https://user-images.githubusercontent.com/30292877/41648876-27970a8e-748b-11e8-8971-64a1a21e5a5f.png">
What if you want to edit the block? Just double click to it and it's raw text will appear in the input bar.
If you want to add some point and get view like this in the bottom then just use semi-colons (;).
1. First point
2. Second point
3. Third point
<img width="912" alt="screen shot 2018-06-20 at 12 23 03" src="https://user-images.githubusercontent.com/30292877/41649172-f20c6fb6-748b-11e8-9ab5-636d50dafb30.png">
With regards __KoStard__ .
