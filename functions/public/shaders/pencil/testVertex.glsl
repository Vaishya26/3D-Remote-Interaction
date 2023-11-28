// #beginglsl vertexshader vertexShader_PosColorOnly
// #version 330 core
layout (location = 0) in vec3 vertPos;	   // Position in attribute location 0
layout (location = 1) in vec3 vertColor;   // Color in attribute location 1
out vec3 theColor;					       // Output a color to the fragment shader
void main()
{
   gl_Position = vec4(vertPos.x, vertPos.y, vertPos.z, 1.0);
   theColor = vertColor;
}
// #endglsl