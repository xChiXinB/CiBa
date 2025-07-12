const input = 
`"Wow!" thought Sarah, staring out her window. It was 6:00 AM, and the city was just beginning to stir. A gentle breeze rustled the leaves of the old oak tree—a comforting sound. Her alarm hadn't even gone off yet, a rare occurrence, wasn't it? She usually woke to its insistent 'beep, beep, beep!'

Today, however, was different. Sarah felt an inexplicable sense of calm; a quiet anticipation. She wondered, "What will today bring?" Perhaps an exciting new project at work? Or maybe a chance encounter with an old friend? The possibilities, she mused, were endless.

She remembered her grandmother's favorite saying: "Life's an adventure; embrace every twist and turn!" That advice, simple yet profound, often guided her. So, with a renewed sense of purpose, Sarah stretched, yawned, and finally whispered, "Let's go, Monday!" The day, she knew, was waiting.`;

// 前置条件：const input = 任何英语句子或文章;

console.log(input.match(/\w+|[^\w]+/g));