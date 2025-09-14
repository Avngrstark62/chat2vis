import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class AIGenerator:
    def __init__(self, animation_guide_path="animation_engine_guide.txt"):
        # Load Gemini API
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

        # Load animation engine guide
        self.animation_guide = self._load_animation_guide(animation_guide_path)

        # Default props for each shape
        self.defaults = {
            "rect": {"x": 50, "y": 100, "width": 80, "height": 50, "fill": "#e74c3c"},
            "circle": {"x": 100, "y": 100, "r": 20, "fill": "#3498db"},
            "text": {"x": 50, "y": 50, "text": "Label", "fontSize": 16, "fill": "#2c3e50"},
            "line": {"x1": 0, "y1": 0, "x2": 100, "y2": 0, "stroke": "#34495e"},
            "arrow": {"x1": 0, "y1": 0, "x2": 100, "y2": 0, "stroke": "#34495e"},
        }

        # Response schema (for Gemini JSON mode)
        self.response_schema = {
            "type": "object",
            "properties": {
                "text": {"type": "string"},
                "visualization": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "duration": {"type": "number"},
                        "layers": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "type": {"type": "string", "enum": ["circle", "rect", "arrow", "line", "text"]},
                                    "props": {
                                        "type": "object",
                                        "properties": {
                                            "x": {"type": "number"},
                                            "y": {"type": "number"},
                                            "width": {"type": "number"},
                                            "height": {"type": "number"},
                                            "r": {"type": "number"},
                                            "x1": {"type": "number"},
                                            "y1": {"type": "number"},
                                            "x2": {"type": "number"},
                                            "y2": {"type": "number"},
                                            "fill": {"type": "string"},
                                            "stroke": {"type": "string"},
                                            "text": {"type": "string"},
                                            "fontSize": {"type": "number"},
                                            "opacity": {"type": "number"}
                                        }
                                    },
                                    "animations": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "property": {"type": "string"},
                                                "from": {"type": "number"},
                                                "to": {"type": "number"},
                                                "start": {"type": "number"},
                                                "end": {"type": "number"}
                                            },
                                            "required": ["property", "from", "to", "start", "end"]
                                        }
                                    },
                                },
                                "required": ["id", "type", "props", "animations"]
                            },
                        },
                    },
                    "required": ["id", "duration", "layers"]
                },
            },
            "required": ["text", "visualization"],
        }

    def _load_animation_guide(self, path):
        try:
            with open(path, "r") as f:
                return f.read()
        except FileNotFoundError:
            return "Animation guide not found."

    def _build_prompt(self, question: str) -> str:
        return f"""
        You are a teacher. Answer this question for a school student: "{question}"

        ANIMATION ENGINE REQUIREMENTS:
        {self.animation_guide}

        CRITICAL OUTPUT FORMAT (follow exactly):
        {{
          "text": "string",
          "visualization": {{
            "id": "string",
            "duration": number,
            "layers": [
              {{
                "id": "string",
                "type": "circle | rect | line | text | arrow",
                "props": {{"x": number, "y": number, ... }},
                "animations": [
                  {{"property": "x | y | opacity | orbit", "from": number, "to": number, "start": number, "end": number}}
                ]
              }}
            ]
          }}
        }}

        Rules:
        1. Always include "duration". If unsure, set to 2000.
        2. Always include "props" with numeric positions and required values.
        3. At least one layer must have an animation.
        4. If you can't think of anything, output a rectangle and a text label with duration=2000.
        """

    def _postprocess(self, result: dict) -> dict:
        vis = result.get("visualization", {})

        # Ensure duration
        if "duration" not in vis:
            max_end = max(
                (a.get("end", 0) for l in vis.get("layers", []) for a in l.get("animations", [])),
                default=0,
            )
            vis["duration"] = max_end + 500 if max_end > 0 else 2000

        # Ensure props defaults
        for layer in vis.get("layers", []):
            shape = layer.get("type")
            base = self.defaults.get(shape, {})
            layer["props"] = {**base, **layer.get("props", {})}

        result["visualization"] = vis
        return result

    def generate(self, question: str) -> dict:
        prompt = self._build_prompt(question)

        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={
                "temperature": 0.3,
                "response_mime_type": "application/json",
                "response_schema": self.response_schema,
            },
        )

        response = model.generate_content(prompt)
        print("Raw AI Response:", response.text)

        try:
            result = json.loads(response.text)
            return self._postprocess(result)

        except Exception as e:
            print("Error parsing AI response:", e)
            return self._fallback(question)

    def _fallback(self, question: str) -> dict:
        return {
            "text": f"I can help explain {question}. This is a fundamental concept that can be visualized.",
            "visualization": {
                "id": "fallback_vis",
                "duration": 4000,
                "layers": [
                    {
                        "id": "title",
                        "type": "text",
                        "props": {"x": 200, "y": 100, "text": "Concept Visualization", "fill": "#2c3e50", "fontSize": 24},
                        "animations": [{"property": "opacity", "from": 0, "to": 1, "start": 0, "end": 1000}],
                    },
                    {
                        "id": "circle1",
                        "type": "circle",
                        "props": {"x": 150, "y": 200, "r": 30, "fill": "#3498db"},
                        "animations": [{"property": "r", "from": 10, "to": 30, "start": 500, "end": 1500}],
                    },
                ],
            },
        }