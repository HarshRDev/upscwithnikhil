# MCQ Upload Guide

This guide explains how to upload Multiple Choice Questions (MCQs) using the Admin Panel. You can upload MCQs in two ways: **Word Documents (.docx)** or **JSON Format**.

## Prerequisites

- Access to Admin Panel (`/admin`)
- MCQs ready in either Word (.docx) format or JSON format
- Optional: Associate with a Test Series ID

---

## Method 1: Upload Word Document (Recommended) ⭐

### Word Document Format

Format your MCQs in a Word document using the following structure:

```
Q1: What is the primary function of the Indian Parliament?
A) To execute laws
B) To make laws
C) To judge laws  
D) To amend constitution
Answer: B
Explanation: Parliament is the legislative body that makes laws in India

Q2: How many states does India have?
A) 28
B) 29
C) 30
D) 31
Answer: A
Explanation: India has 28 states
```

### Key Rules for Word Format

1. **Question Number**: Start with `Q1:`, `Q2:`, `Q3:` etc. or `Question 1:`, etc.
2. **Options**: Use `A)`, `B)`, `C)`, `D)` format (or `1)`, `2)`, `3)`, `4)`)
3. **Correct Answer**: Use `Answer:` or `Correct Answer:` followed by the letter (A, B, C, D)
4. **Explanation**: Use `Explanation:` followed by the explanation text (**optional**)
5. **Separators**: Blank lines between questions improve clarity

### Steps to Upload Word File

1. Navigate to **Admin Panel** → **MCQs Tab**
2. Click **📄 Upload Word File** tab
3. (Optional) Enter **Test Series ID** for organization
4. Click the upload area or drag and drop your .docx file
5. System automatically parses and validates the document
6. Success message confirms upload

### Example Word Document

Save this as `my_mcqs.docx`:

```
Q1: Which article of the Indian Constitution deals with Fundamental Rights?
A) Article 12-35
B) Article 36-51
C) Article 52-62
D) Article 73-78
Answer: A
Explanation: Articles 12-35 of the Indian Constitution enumerate Fundamental Rights

Q2: What is the term of Indian President?
A) 4 years
B) 5 years
C) 6 years
D) 7 years
Answer: B
Explanation: The President of India serves a 5-year term

Q3: Who was the first Prime Minister of India?
A) Dr. Rajendra Prasad
B) Jawaharlal Nehru
C) Sardar Vallabhbhai Patel
D) Dr. B.R. Ambedkar
Answer: B
Explanation: Jawaharlal Nehru was the first Prime Minister of India
```

---

## Method 2: Paste JSON Format

### JSON Structure

MCQs must be uploaded as a **JSON array**:

```json
[
  {
    "question": "What is the primary function of the Indian Parliament?",
    "option_a": "To execute laws",
    "option_b": "To make laws",
    "option_c": "To judge laws",
    "option_d": "To amend constitution",
    "correct_answer": "B",
    "explanation": "Parliament is the legislative body that makes laws"
  },
  {
    "question": "How many states does India have?",
    "option_a": "28",
    "option_b": "29",
    "option_c": "30",
    "option_d": "31",
    "correct_answer": "A",
    "explanation": "India has 28 states"
  }
]
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | String | Yes | The MCQ question text |
| option_a | String | Yes | First option |
| option_b | String | Yes | Second option |
| option_c | String | Yes | Third option |
| option_d | String | Yes | Fourth option |
| correct_answer | String (A/B/C/D) | Yes | Correct option letter |
| explanation | String | Optional | Explanation for the answer |

### Steps to Upload JSON

1. Navigate to **Admin Panel** → **MCQs Tab**
2. Click **📋 Paste JSON** tab
3. (Optional) Enter **Test Series ID**
4. Copy-paste your **JSON array** into the text field
5. Click **Upload MCQs**
6. Success message confirms upload

---

## Comparison: Word vs JSON

| Feature | Word File | JSON |
|---------|-----------|------|
| Ease of Use | ✅ Simple formatting | ⚠️ Requires syntax |
| Natural Format | ✅ Human readable | ⚠️ Less readable |
| Auto-parsing | ✅ Automatic | ✗ Manual format |
| Large Batches | ✅ Excellent | ✅ Good |
| File Size | ✅ Smaller | ✅ Compact |
| Recommended | ✅ **YES** | ⚠️ For advanced users |

---

## Tips & Best Practices

### For Word Documents
1. **Keep it Simple**: Use clean, consistent formatting
2. **Text Only**: Avoid images, tables, or special formatting
3. **Clear Structure**: Separate questions with blank lines
4. **Consistency**: Use same format for all questions
5. **File Format**: Always use .docx (not .doc or PDF)
6. **Test Upload**: Upload a small batch first to verify parsing

### For JSON
1. **Validate JSON**: Use [jsonlint.com](https://jsonlint.com) before uploading
2. **Check Syntax**: Ensure proper commas, brackets, quotes
3. **Backup**: Keep a backup copy of your MCQ JSON
4. **Consistency**: Match exact field names and formatting

---

## Troubleshooting

### Word File Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "No MCQs found" | Format doesn't match | Follow format guidelines exactly |
| Questions skipped | Missing answer field | Every question needs "Answer: X" |
| Options not parsed | Wrong format | Use A), B), C), D) exactly |
| Parse error | File corruption | Re-save as .docx |

### JSON Issues

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid JSON | Syntax error | Validate at [jsonlint.com](https://jsonlint.com) |
| Missing data | Incomplete fields | Ensure all required fields present |
| Cannot upload | Wrong format | Double-check field names match |

---

## Batch Processing

### Large Question Sets

For documents with 100+ questions:
1. **Option A**: Upload in batches of 50 questions
2. **Option B**: Use JSON format for better reliability
3. **Space**: Each upload creates separate entries (can be viewed together)

---

## Excel to Word/JSON Conversion

### If you have MCQs in Excel:

**Option 1: Convert to Word (Recommended)**
1. Copy Excel data
2. Paste into Word document
3. Format according to Word guidelines above
4. Upload via **📄 Upload Word File** tab

**Option 2: Convert to JSON**
1. Export Excel to CSV
2. Use online tool: [CSV to JSON](https://csvjson.com/csv2json)
3. Adjust format to match JSON structure
4. Upload via **📋 Paste JSON** tab

---

## Student Experience

Once uploaded, MCQs will:
- ✅ Be available for students to attempt
- ✅ Auto-track student responses
- ✅ Calculate scores instantly
- ✅ Show in performance dashboard
- ✅ Display explanations after completion
- ✅ Build student learning history

---

## FAQ

**Q: Can I upload both Word and JSON in same session?**
A: Yes! Upload Word, then switch to JSON tab and upload more.

**Q: Is there a limit to MCQ count?**
A: No hard limit, but batches of 50-100 work best for Word parsing.

**Q: Can I edit MCQs after uploading?**
A: Currently no, but you can delete and re-upload with corrections.

**Q: Will explanations be shown to students?**
A: Yes, after they complete the test and submit answers.

**Q: Can I associate multiple test series?**
A: Each batch requires a separate upload with different Test Series ID.

---

## Support

For issues or questions, contact the development team.
