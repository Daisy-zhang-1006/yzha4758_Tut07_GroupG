# Cow Animation- Time Based
## Creative Coding Major Project
### yzha4758_Tut07_GroupG
#### Intoduction
This project is a time based animated visual made with p5.js. Both the lively cow and the painterly background move smoothly, driven by real elapsed time, not frame count. Press spacebar to pause/resume the animaion and experience how timer-driven visuals create a unique rhtyhmic , and interactive artwork.
##### How to Interect
When the page loaded, the animation will play automatically.
- Colorful dynamic oil painting backround "flowed" like breath.
- Press Space button can pause/resume the animation, all the animatin will "stop" or "resume" at same time, indicate the "time based"
- Mouse and keyboard not influence the cow or backgournd directly, only used to pause/resume.

### Animation Explanation
- I choose the **"timer"** to drive all animation, which is different from aduio, User input, and perlin noise. All the movement and change are decide by "The actual number of seconds that have elapsed since the program started.", not related with refresh rate and frame rate.

### Animation properties and methods
Body: Overall up-and-down movement and slight left-right shaking.
Limbs: Large alternating swings, with slight phase differences between each leg, creating a strong animation rhythm.
Background:
Each frame dynamically generates tens of thousands of ‘oil paint brushstrokes’ based on elapsed time, with colours and directions fluctuating over time, giving the scene the ‘vibrant feel’ of a real oil painting.
Noise textures are applied to enhance texture.

### Difference 
All my animations are driven solely by ‘time,’ without using mouse interaction, audio analysis, or even Perlin noise.
Other students chose methods such as ‘colour transformation sound effects/user input/partial drawing’ for their animations; I opted for a more physically meaningful overall dynamic effect (the cow ‘moves,’ and the background breathes and flows).
I enhanced the sense of time control with a ‘pause/resume’ mechanism (spacebar), allowing the animation to be frozen and resumed at any time without desynchronisation.
### Reference
！[ Untitled.Bull] ()
https://www.wikiart.org/en/elaine-de-kooning/untitled-bull-1973

### Change Explanation
The original edition only have a solid background and a tiny wave bull, the animation effecy mainly rely on frameCount, the sense of time based is not strong.
Current Edition changed all dirven motion of the animation into time based that make the animation effect increasling imrpoved. The cow and background become more reality and all effect is pushed by real time elipse instead of the frame rate.

### External Tool and technology
https://p5js.org/reference/
All technics in this project used p5.js, millis(), noise(), and sin() formular are learnt from the p5.js official website 

### ### Github Links
https://github.com/Daisy-zhang-1006/yzha4758_Tut07_GroupG.git

