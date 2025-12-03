# CV Builder - Upload & Smart Analysis Feature

## Overview
The CV Builder now supports uploading existing CVs with intelligent data extraction and smart step navigation.

## Features

### 1. **CV Upload Modal**
- **Location**: `/components/cv/CVUploadModal.js`
- Appears when user first opens CV builder
- Two options:
  - **Start from Scratch**: Traditional step-by-step builder
  - **Upload Existing CV**: Upload PDF or Word document

### 2. **Smart CV Parsing**
- **API Endpoint**: `/api/cv/parse`
- Supported formats: PDF, DOCX
- Max file size: 10MB
- Features:
  - Extracts personal information (name, email, phone, location)
  - Parses work experience with dates and descriptions
  - Identifies education history
  - Extracts skills and certifications
  - Detects professional summary

### 3. **Missing Fields Detection**
- Analyzes uploaded CV for completeness
- Identifies missing or incomplete sections:
  - Personal information gaps
  - Missing work experience
  - Incomplete education
  - Skills section issues
- Generates user-friendly notifications

### 4. **Smart Step Navigation**
- After upload, user is taken to the first incomplete step
- Example flow:
  - If experience is missing → Goes to Step 3 (Experience)
  - If all data complete → Goes to Step 6 (Settings)
- Shows notification with option to skip

### 5. **Section Reordering**
- **Component**: `/components/cv/SectionReorder.js`
- Located in Settings step (Step 6)
- Features:
  - Drag-and-drop reordering
  - Arrow buttons for fine control
  - Toggle section visibility
  - Cannot hide required sections
  - Visual feedback for hidden sections

### 6. **Section Visibility Control**
- Toggle sections on/off
- Hidden sections:
  - Don't appear in final CV
  - Data is preserved for later
  - Marked with strikethrough
- Required sections cannot be hidden

## User Flow

### Starting from Scratch
1. Open CV Builder
2. See upload modal
3. Click "Start from Scratch"
4. Follow normal 7-step process

### Uploading Existing CV
1. Open CV Builder
2. See upload modal
3. Click "Upload Existing CV"
4. Select PDF or DOCX file
5. System analyzes CV (shows spinner)
6. **If complete**: Go to Settings (Step 6) with data pre-filled
7. **If incomplete**: Go to first incomplete step with notification
8. User can:
   - Complete missing information
   - Click "Skip for now" to go to Settings
   - Click "Got it" to dismiss notification and continue

## Technical Details

### Data Structure
```javascript
{
  personalInfo: {
    firstName, lastName, email, phone,
    location, title, website, linkedin, github, photo
  },
  summary: string,
  experience: [{
    id, company, title, location,
    startDate, endDate, current, description, bullets
  }],
  education: [{
    id, school, degree, field,
    startDate, endDate, gpa, honors
  }],
  skills: {
    technical: [],
    soft: [],
    languages: [],
    certifications: []
  }
}
```

### Section Order Structure
```javascript
[
  { id: 'summary', label: 'Professional Summary', visible: true, required: true },
  { id: 'experience', label: 'Work Experience', visible: true, required: true },
  { id: 'education', label: 'Education', visible: true, required: true },
  { id: 'skills', label: 'Skills', visible: true, required: true },
  { id: 'projects', label: 'Projects', visible: false, required: false },
  { id: 'certifications', label: 'Certifications', visible: false, required: false }
]
```

## API Integration

### Parse CV API
- **Endpoint**: `POST /api/cv/parse`
- **Content-Type**: `multipart/form-data`
- **Parameters**: 
  - `file`: PDF or DOCX file
- **Response**:
```javascript
{
  success: true,
  data: { /* structured CV data */ },
  missingFields: [
    { field: 'experience', step: 3, message: '...' }
  ],
  startStep: 3,
  rawText: '...' // First 500 chars for debugging
}
```

## Future Enhancements

1. **PDF Export with Section Order**
   - Respect user's section ordering in final PDF
   - Apply visibility settings

2. **Enhanced AI Analysis**
   - Better field extraction accuracy
   - Skill categorization (technical vs soft)
   - Experience bullet point generation

3. **Template Compatibility**
   - Show which sections each template supports
   - Warn if hidden sections are recommended for template

4. **Save Section Preferences**
   - Remember user's preferred section order
   - Apply to future CVs

## Testing

### Test Upload Flow
1. Create test CV with:
   - Complete information
   - Missing experience
   - Missing education
   - Missing skills
2. Upload each and verify:
   - Correct step navigation
   - Appropriate notifications
   - Data pre-filling

### Test Section Reordering
1. Open Settings step
2. Drag sections up/down
3. Toggle visibility
4. Verify changes persist
5. Check final CV reflects order

## Known Issues

1. PDF parsing may fail for image-based PDFs (scanned documents)
2. Complex formatting in Word docs may not parse correctly
3. Section order changes don't yet affect PDF export (requires template updates)

## Files Modified/Created

### New Files
- `/components/cv/CVUploadModal.js`
- `/components/cv/CVUploadModal.module.css`
- `/components/cv/SectionReorder.js`
- `/components/cv/SectionReorder.module.css`
- `/app/api/cv/parse/route.js`

### Modified Files
- `/app/cv-builder/create/CVBuilderContent.js`
  - Added upload modal integration
  - Added section order state
  - Added missing fields notification
  - Added skip functionality
- `/app/cv-builder/create/create.module.css`
  - Added notification banner styles
