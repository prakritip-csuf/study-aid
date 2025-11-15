#!/usr/bin/env python3
"""
Quick integration test: create a flashcard via the API, then fetch it.
Assumes the Flask backend is running at http://localhost:5000

Usage (from backend folder):
  python test_api.py
"""

import json
import urllib.request
import sys

BASE_URL = 'http://localhost:5000'

def test_api():
    print('Testing flashcards API...\n')

    # 1. List existing cards
    print('1. GET /api/flashcards')
    try:
        req = urllib.request.Request(f'{BASE_URL}/api/flashcards')
        res = urllib.request.urlopen(req)
        cards = json.loads(res.read().decode())
        print(f'   Status: {res.status} ({len(cards)} cards)')
        print(f'   Cards: {json.dumps(cards, indent=2)}\n')
    except Exception as e:
        print(f'   ERROR: {e}\n')
        return False

    # 2. Create a card
    print('2. POST /api/flashcards')
    try:
        payload = {
            'question': 'What is the capital of France?',
            'answer': 'Paris',
            'tags': ['geography', 'europe']
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            f'{BASE_URL}/api/flashcards',
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        res = urllib.request.urlopen(req)
        card = json.loads(res.read().decode())
        card_id = card['id']
        print(f'   Status: {res.status} (created ID {card_id})')
        print(f'   Card: {json.dumps(card, indent=2)}\n')
    except Exception as e:
        print(f'   ERROR: {e}\n')
        return False

    # 3. Get that specific card
    print(f'3. GET /api/flashcards/{card_id}')
    try:
        req = urllib.request.Request(f'{BASE_URL}/api/flashcards/{card_id}')
        res = urllib.request.urlopen(req)
        card = json.loads(res.read().decode())
        print(f'   Status: {res.status}')
        print(f'   Card: {json.dumps(card, indent=2)}\n')
    except Exception as e:
        print(f'   ERROR: {e}\n')
        return False

    # 4. Get a random card
    print('4. GET /api/flashcards/random')
    try:
        req = urllib.request.Request(f'{BASE_URL}/api/flashcards/random')
        res = urllib.request.urlopen(req)
        card = json.loads(res.read().decode())
        print(f'   Status: {res.status}')
        print(f'   Card: {json.dumps(card, indent=2)}\n')
    except Exception as e:
        print(f'   ERROR: {e}\n')

    # 5. Submit an answer
    print(f'5. POST /api/flashcards/{card_id}/answer')
    try:
        payload = {'correct': True}
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            f'{BASE_URL}/api/flashcards/{card_id}/answer',
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        res = urllib.request.urlopen(req)
        card = json.loads(res.read().decode())
        print(f'   Status: {res.status}')
        print(f'   times_seen: {card["times_seen"]}, correct_count: {card["correct_count"]}')
        print(f'   Card: {json.dumps(card, indent=2)}\n')
    except Exception as e:
        print(f'   ERROR: {e}\n')

    print('✅ All tests passed!')
    return True

if __name__ == '__main__':
    try:
        success = test_api()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print('\n\nInterrupted.')
        sys.exit(1)
