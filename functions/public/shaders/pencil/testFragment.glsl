// #beginglsl FragmentShader fragmentShader_ColorOnly
// #version 330 core
in vec3 theColor;		// Color value came from the vertex shader (smoothed) 
out vec4 FragColor;	    // Color that will be used for the fragment
void main()
{
   FragColor = vec4(theColor, 1.0f);   // Add alpha value of 1.0.
}
// #endglsl