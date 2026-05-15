import ollama


def generate_response(user_query, predicted_class):

    # Strong mental health focused system prompt
    system_prompt = f"""
You are MindCare AI, a supportive mental health assistant.

STRICT RULES:
- Only answer mental health related questions.
- Never answer coding, politics, hacking, mathematics, or unrelated topics.
- Give calm, empathetic, and supportive responses.
- Keep responses short and natural.
- Never provide harmful advice.
- If suicidal intent is detected, encourage seeking professional help or trusted support.
- Do not pretend to be a licensed doctor.
- Avoid long paragraphs.

Detected Emotion Category: {predicted_class}

User Message:
{user_query}
"""

    try:

        response = ollama.chat(
            model='tinyllama',
            messages=[
                {
                    'role': 'system',
                    'content': system_prompt
                },
                {
                    'role': 'user',
                    'content': user_query
                }
            ]
        )

        final_response = response['message']['content']

        return final_response

    except Exception as e:

        return f"Error generating response: {str(e)}"