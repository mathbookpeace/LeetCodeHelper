# Commands
## lch fmt

This command simply replace [] to {}.  
You can copy leetcode test case to a document and use "lch fmt" command to format it.  

For example,  
[1,2,2,3,4,4,3]  
format to  
{1,2,2,3,4,4,3}  


## lch reset
This command replace current file with current.template file  
For example, you have a file name is "leetcode.cpp",  
this command replace the content of "leetcode.cpp" with "leetcode.cpp.template"  

If there is a "line=line_number" at the first line of your template file.
This extension will move your cursor to the line, after reset your file.

For example,
There is a comment "// line=87" at the first line,
after reseting the file, your cursor will move to line 87.