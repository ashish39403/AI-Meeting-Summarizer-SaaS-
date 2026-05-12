# apps/summaries/llm_client.py

import logging
import time
import os

from typing import Dict, Any
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate , PromptTemplate

from .prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from .parsers import SummaryParser

import tiktoken

logger = logging.getLogger(__name__)

load_dotenv()


class MeetingSummarizer:
    """Production-ready LLM client for meeting summarization"""

    def __init__(self, model: str = "openai/gpt-3.5-turbo"):

        self.model = model

        # Initialize LLM
        self.llm = ChatOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL"),
            model=model,
            temperature=0.6,
            max_tokens=2000,
            timeout=60,
            max_retries=2,
        )

        # Create Prompt Template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("user", USER_PROMPT_TEMPLATE),
        ])

        # Create Chain
        self.chain = self.prompt | self.llm
    def _count_tokens(self, text: str) -> int:
        """Count tokens"""

        try:
            encoding = tiktoken.encoding_for_model(self.model)
            return len(encoding.encode(text))

        except Exception:
            return len(text) // 4
    def summarize(self, transcript: str) -> Dict[str, Any]:

        start_time = time.time()

        try:

            # Count prompt tokens
            full_prompt = (
                SYSTEM_PROMPT +
                USER_PROMPT_TEMPLATE.format(
                    transcript=transcript
                )
            )

            prompt_tokens = self._count_tokens(full_prompt)

            # Invoke Chain
            response = self.chain.invoke({
                "transcript": transcript
            })

            # Parse response
            parsed_data = SummaryParser.parse(
                response.content
            )

            # Count completion tokensa 
            completion_tokens = self._count_tokens(
                response.content
            )

            # Calculate duration
            duration_ms = int(
                (time.time() - start_time) * 1000
            )

            # Pricing estimation
            input_cost = (
                prompt_tokens / 1000
            ) * 0.0015

            output_cost = (
                completion_tokens / 1000
            ) * 0.002

            total_cost = input_cost + output_cost

            # Sentiment scoring
            sentiment_map = {
                "positive": 0.8,
                "neutral": 0.0,
                "negative": -0.8,
            }

            sentiment_score = sentiment_map.get(
                parsed_data.get("sentiment", "neutral"),
                0.0
            )

            return {

                "success": True,

                "data": parsed_data,

                "model_used": self.model,

                "prompt_tokens": prompt_tokens,

                "completion_tokens": completion_tokens,

                "total_tokens": (
                    prompt_tokens +
                    completion_tokens
                ),

                "duration_ms": duration_ms,

                "cost": round(total_cost, 6),

                "sentiment_score": sentiment_score,
            }

        except Exception as e:

            logger.error(
                f"LLM summarization failed: {str(e)}"
            )

            duration_ms = int(
                (time.time() - start_time) * 1000
            )

            return {

                "success": False,

                "error": str(e),

                "duration_ms": duration_ms,
            }

  

    def summarize_with_retry(
        self,
        transcript: str,
        max_retries: int = 3
    ) -> Dict[str, Any]:

        last_error = None

        for attempt in range(max_retries):

            result = self.summarize(transcript)

            if result["success"]:

                result["retry_count"] = attempt

                return result

            last_error = result.get(
                "error",
                "Unknown Error"
            )

            wait_time = 2 ** attempt

            logger.warning(
                f"Retry {attempt + 1}/{max_retries} "
                f"after {wait_time}s: {last_error}"
            )

            time.sleep(wait_time)

        return {

            "success": False,

            "error": (
                f"Failed after "
                f"{max_retries} retries: "
                f"{last_error}"
            ),

            "retry_count": max_retries,
        }