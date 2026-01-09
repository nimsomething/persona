# Versioning and Debugging Guide

## Semantic Versioning

This project follows semantic versioning (SemVer) with the format `MAJOR.MINOR.PATCH`.

### Version Structure

- **MAJOR**: Incompatible API changes or major feature overhauls
- **MINOR**: New functionality added in a backward-compatible manner
- **PATCH**: Bug fixes and small improvements

### Current Version: 2.0.1

- **2.0.0**: Initial v2 release with enhanced features
- **2.0.1**: Bug fixes and improvements to persistence, logging, and error handling

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.1 | Current | • Fixed localStorage persistence bug<br>• Added centralized logging service<br>• Improved error handling and user messaging<br>• Enhanced version tracking |
| 2.0.0 | Previous | • Major v2 release with dual profiles<br>• MBTI integration<br>• PDF generation<br>• Enhanced scoring |

## Logging System

The application includes a comprehensive logging service (`src/services/loggerService.js`) that provides structured logging across all components.

### Log Levels

- **DEBUG**: Detailed diagnostic information (disabled by default in production)
- **INFO**: General informational messages about application flow
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failures and exceptions

### Log Categories

Logs are categorized for easier filtering:
- `storage`: All localStorage operations
- `assessment`: Assessment lifecycle events (start, complete, auto-save)
- `pdf`: PDF generation events
- `ui`: UI-related events
- `app`: Application-level events
- `global`: Global error handlers

### Enabling Debug Mode

Add `?debug=true` to the URL to enable detailed logging:

```
http://localhost:5173/?debug=true
```

When debug mode is enabled:
- All log levels are shown (including DEBUG)
- Storage operations are logged to localStorage for troubleshooting
- Logger is exposed to window as `window.__logger`

### Debug Utilities

When debug mode is enabled, you can use these browser console commands:

```javascript
// Check current debug status
window.__logger

// Toggle debug on/off
window.__toggleDebug(true)
window.__toggleDebug(false)

// Access debug logs from localStorage
window.__logger.saveToLocalStorageDebug() // automatic in debug mode
```

### Viewing Logs in Console

Logs appear in the console with color-coded levels:
- 🔍 DEBUG (gray)
- ℹ️ INFO (blue)
- ⚠️ WARN (amber)
- ❌ ERROR (red)

Each log entry includes:
- Timestamp (ISO format)
- Log level
- Category
- App version
- Contextual data

### Example Log Output

```
ℹ️ 2024-01-09T14:30:00.000Z [INFO] [STORAGE] Completed assessment saved
{
  userName: "John Doe",
  assessmentId: "session_1704801000000_abc123",
  archetype: "The Innovator",
  totalAssessments: 1
}
```

## Storage and Persistence

### localStorage Keys

- `personality_assessment_v2`: Completed assessments (up to 5)
- `assessment_session`: In-progress session data

### Data Structure

**Completed Assessment:**
```json
{
  "id": "session_1234567890_abc123def",
  "userName": "John Doe",
  "results": { /* assessment results */ },
  "completedAt": "2024-01-09T14:30:00.000Z",
  "version": "2.0.1"
}
```

**Session Data:**
```json
{
  "sessionId": "session_1234567890_abc123def",
  "userName": "John Doe",
  "currentQuestion": 10,
  "responses": { "q1": 3, "q2": 4, ... },
  "lastUpdated": "2024-01-09T14:25:00.000Z",
  "startedAt": "2024-01-09T14:00:00.000Z"
}
```

### Session Recovery

- Auto-recovery happens on page load if a session exists
- Sessions older than 7 days are automatically cleared
- Completed assessments persist and can be viewed on refresh

### Error Recovery

The application handles storage errors gracefully:
- **Quota exceeded**: User is warned to download PDF
- **Corrupted data**: App continues, logs error, allows restart
- **Storage unavailable**: Functions without persistence

## Error Handling

### User-Friendly Error Messages

All errors are displayed with clear, actionable messages:

1. **Storage Errors** (yellow warning):
   - "Your results may not be saved if you refresh the page. Please download the PDF report."

2. **PDF Generation Errors** (red error):
   - "Unable to generate PDF: [specific error message]"

3. **Recovery Errors** (red error):
   - "Unable to load your previous assessment. Please take the assessment again."

### Error Logging

All errors are logged with full context:
- Error type and message
- Stack trace (when available)
- Operation being performed
- Relevant data (user name, question ID, etc.)

## Troubleshooting

### Results not saving on refresh

1. Check console for storage errors
2. Verify localStorage is available (browser settings)
3. Check for quota errors (clear old data if needed)
4. Enable debug mode to see detailed storage operations

### PDF generation fails

1. Check console for PDF-related errors
2. Verify jspdf and jspdf-autotable are loaded
3. Check browser console for CORS issues
4. Enable debug mode for detailed PDF logging

### Assessment data lost

1. Check browser localStorage settings
2. Look for completed assessments in localStorage
3. Enable debug mode and check logs
4. Verify version compatibility (v2.x required)

## Development Tips

### Adding New Logging

```javascript
import logger from '../services/loggerService';

// Log an event
logger.info('User action', { action: 'clicked', target: 'button' }, 'ui');

// Log with measurement
await logger.measureAsyncOperation(
  'Data processing',
  () => processData(data),
  'performance'
);
```

### Testing Storage

```javascript
// Enable debug mode
import { isDebugEnabled } from '../utils/debug';
console.log('Debug enabled:', isDebugEnabled);

// Check localStorage
const assessments = storageService.getCompletedAssessments();
console.log('Completed assessments:', assessments.length);
```

## Accessibility

The logging system is designed to be:
- **Non-intrusive**: Only logs when enabled or on error
- **Performance-aware**: Minimal impact on app performance
- **Browser-compatible**: Works in all modern browsers
- **Privacy-respecting**: No personal data sent externally
