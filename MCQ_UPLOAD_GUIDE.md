# MCQ Upload Guide

This guide explains how to upload Multiple Choice Questions (MCQs) using the Admin Panel.

## Prerequisites

- Access to Admin Panel (`/admin`)
- MCQs ready in JSON format
- Optional: Associate with a Test Series ID

## JSON Format

MCQs must be uploaded as a **JSON array**. Each question object must contain:

```json
[
  {
    "question": "What is the primary function of the Indian Parliament?",
    "option_a": "To execute laws",
    "option_b": "To make laws",
    "option_c": "To judge laws",
    "option_d": "To amend constitution",
    "correct_answer": "B",
    "explanation": "Parliament is the legislative body that makes laws in India"
  },
  {
    "question": "How many states does India have as per the Constitution?",
    "option_a": "28",
    "option_b": "29",
    "option_c": "30",
    "option_d": "31",
    "correct_answer": "A",
    "explanation": "India has 28 states as of the last amendment"
  }
]
```

## Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | String | Yes | The MCQ question text |
| option_a | String | Yes | First option |
| option_b | String | Yes | Second option |
| option_c | String | Yes | Third option |
| option_d | String | Yes | Fourth option |
| correct_answer | String (A/B/C/D) | Yes | Correct option letter |
| explanation | String | Optional | Explanation for the answer |

## Steps to Upload

1. Navigate to **Admin Panel** → **MCQs Tab**
2. (Optional) Enter **Test Series ID** if questions belong to specific test
3. Copy-paste your **JSON array** into the text field
4. Click **Upload MCQs**
5. Success message will confirm upload

## Example: Complete Upload

### Step 1: Prepare JSON
```json
[
  {
    "question": "Which article of the Indian Constitution deals with Fundamental Rights?",
    "option_a": "Article 12-35",
    "option_b": "Article 36-51",
    "option_c": "Article 52-62",
    "option_d": "Article 73-78",
    "correct_answer": "A",
    "explanation": "Articles 12-35 of the Indian Constitution enumerate Fundamental Rights"
  },
  {
    "question": "What is the term of Indian President?",
    "option_a": "4 years",
    "option_b": "5 years",
    "option_c": "6 years",
    "option_d": "7 years",
    "correct_answer": "B",
    "explanation": "The President of India serves a 5-year term"
  }
]
```

### Step 2: Copy to Admin Panel
- Open `/admin` page
- Click **MCQs** tab
- Paste the JSON into the text area
- Click **Upload MCQs**

### Result
✅ MCQs will be stored in database and available for students to attempt

## Validation Rules

- JSON must be valid (check for syntax errors)
- Each question must have all 4 options
- `correct_answer` must be one of: A, B, C, or D
- `question` and options cannot be empty
- Maximum recommended MCQs per upload: 100

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid JSON format | Syntax error in JSON | Validate JSON using [jsonlint.com](https://jsonlint.com) |
| Missing required fields | Missing question/options | Ensure all fields are filled |
| Wrong correct_answer | Not A/B/C/D | Use only these letters in lowercase |

## Tips

1. **Batch Uploads**: You can upload MCQs in batches (no limit on number of batches)
2. **Test Series Association**: Optionally link to a Test Series for organization
3. **Explanation**: Always include explanation for better student learning
4. **Excel to JSON**: Use a script or online converter if MCQs are in Excel
5. **Backup**: Keep a backup of your MCQ JSON before uploading

## Excel to JSON Conversion

If you have MCQs in Excel:

1. Export Excel to CSV
2. Use online converter: [CSV to JSON](https://csvjson.com/csv2json)
3. Adjust the output to match the required format above
4. Paste into Admin Panel

## Student Experience

Once uploaded, MCQs will be:
- Available for students to attempt
- Tracked in their response history
- Scored automatically (correct/incorrect)
- Shown in performance dashboard

## Support

For issues or questions, contact the development team.
