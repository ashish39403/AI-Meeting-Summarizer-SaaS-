# apps/summaries/parsers.py

import json
import re
from typing import Dict, Any

class SummaryParser:
    """Parse LLM response into structured summary data"""
    
    @staticmethod
    def parse(response_text: str) -> Dict[str, Any]:
        """
        Extract JSON from LLM response and convert to structured format
        """
        print(f"DEBUG - Raw response: {response_text[:500]}")  # Debug
        
        # Try multiple parsing strategies
        data = {}
        
        # Strategy 1: Direct JSON parse
        try:
            data = json.loads(response_text)
            print("DEBUG - Direct JSON parse success")
        except json.JSONDecodeError:
            pass
        
        # Strategy 2: Extract JSON from markdown code block
        if not data:
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                try:
                    data = json.loads(json_match.group(1))
                    print("DEBUG - Markdown JSON parse success")
                except json.JSONDecodeError:
                    pass
        
        # Strategy 3: Find any JSON object in text
        if not data:
            json_match = re.search(r'\{[^{}]*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    data = json.loads(json_match.group(0))
                    print("DEBUG - Regex JSON parse success")
                except json.JSONDecodeError:
                    pass
        
        # Strategy 4: Fallback - extract text manually
        if not data or not data.get('summary'):
            print("DEBUG - Using fallback parsing")
            return SummaryParser._fallback_parse(response_text)
        
        # Ensure all fields exist with proper types
        result = {
            'summary': data.get('summary', '') or data.get('content', ''),
            'short_summary': data.get('short_summary', '') or (data.get('summary', '')[:100] if data.get('summary') else ''),
            'decisions': data.get('decisions', []) if isinstance(data.get('decisions'), list) else [],
            'action_items': data.get('action_items', []) if isinstance(data.get('action_items'), list) else [],
            'key_points': data.get('key_points', []) if isinstance(data.get('key_points'), list) else [],
            'attendees': data.get('attendees', []) if isinstance(data.get('attendees'), list) else [],
            'sentiment': data.get('sentiment', 'neutral'),
        }
        
        print(f"DEBUG - Parsed result: summary length = {len(result['summary'])}")
        return result
    
    @staticmethod
    def _fallback_parse(text: str) -> Dict[str, Any]:
        """Fallback parser when JSON extraction fails"""
        lines = text.strip().split('\n')
        summary_lines = []
        decisions = []
        action_items = []
        key_points = []
        
        for line in lines:
            line = line.strip()
            line_lower = line.lower()
            
            if not line:
                continue
            
            if 'decision' in line_lower or 'decisions' in line_lower:
                if ':' in line:
                    decisions.append(line.split(':', 1)[1].strip())
                elif line.startswith('-') or line.startswith('•'):
                    decisions.append(line.lstrip('-• ').strip())
            elif 'action' in line_lower:
                if ':' in line:
                    action_items.append(line.split(':', 1)[1].strip())
                elif line.startswith('-') or line.startswith('•'):
                    action_items.append(line.lstrip('-• ').strip())
            elif line.startswith('-') or line.startswith('•'):
                key_points.append(line.lstrip('-• ').strip())
            else:
                summary_lines.append(line)
        
        # Combine summary
        summary = ' '.join(summary_lines)
        if len(summary) > 500:
            summary = summary[:500]
        
        return {
            'summary': summary,
            'short_summary': summary[:100] if summary else '',
            'decisions': decisions,
            'action_items': action_items,
            'key_points': key_points,
            'attendees': [],
            'sentiment': 'neutral',
        }