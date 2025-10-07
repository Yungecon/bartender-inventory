'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ConfirmationReaderProps {
  text: string
  onConfirm: () => void
  onReject: () => void
  autoPlay?: boolean
}

export function ConfirmationReader({ text, onConfirm, onReject, autoPlay = true }: ConfirmationReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      setIsSupported(true)
      
      if (autoPlay && text) {
        speakText(text)
      }
    } else {
      setIsSupported(false)
    }
  }, [text, autoPlay])

  const speakText = (textToSpeak: string) => {
    if (!isSupported || !textToSpeak) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.rate = 0.8 // Slightly slower for clarity
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }

  if (!text) {
    return null
  }

  return (
    <Card className="w-full border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">Confirm Your Entry</CardTitle>
        <CardDescription>
          Please confirm the voice input was understood correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-white rounded-lg border">
          <p className="text-lg font-medium text-center">"{text}"</p>
        </div>

        <div className="flex flex-col space-y-3">
          {isSupported && (
            <div className="flex justify-center space-x-2">
              <Button
                onClick={() => speakText(text)}
                variant="outline"
                size="sm"
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                    Playing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824zM15 8a2 2 0 012 2v0a2 2 0 01-2 2" clipRule="evenodd" />
                    </svg>
                    Repeat
                  </>
                )}
              </Button>
              
              {isPlaying && (
                <Button
                  onClick={stopSpeaking}
                  variant="outline"
                  size="sm"
                >
                  Stop
                </Button>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={onConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              ✓ Correct
            </Button>
            <Button
              onClick={onReject}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              ✗ Try Again
            </Button>
          </div>
        </div>

        {!isSupported && (
          <p className="text-sm text-gray-500 text-center">
            Text-to-speech not available in this browser
          </p>
        )}
      </CardContent>
    </Card>
  )
}