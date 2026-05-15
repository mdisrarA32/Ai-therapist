import torch
from sklearn.preprocessing import LabelEncoder
from transformers import BertTokenizer, BertForSequenceClassification

# Load model
model = BertForSequenceClassification.from_pretrained('./bert_tweet_model')

# Load tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

# Label encoder
encoder = LabelEncoder()
encoder.fit(['Anxiety', 'Depression', 'Normal', 'Suicidal'])


def predict_text(text):
    
    inputs = tokenizer(
        text,
        return_tensors='pt',
        truncation=True,
        padding=True,
        max_length=128
    )

    with torch.no_grad():
        outputs = model(**inputs)

    prediction = torch.argmax(outputs.logits, dim=1).item()

    predicted_label = encoder.inverse_transform([prediction])[0]

    return predicted_label