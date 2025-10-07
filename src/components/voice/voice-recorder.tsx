'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  onError: (error: string) => void
  isListening?: boolean
}

export function VoiceRecorder({ onTranscription, onError, isListening = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if speech recognition is supported across different browsers
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition || 
      (window as any).mozSpeechRecognition || 
      (window as any).msSpeechRecognition
    
    if (SpeechRecognition) {
      try {
        setIsSupported(true)
        
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        
        // Add additional browser-specific configurations
        if (recognition.maxAlternatives) {
          recognition.maxAlternatives = 1
        }
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          onTranscription(transcript.trim())
          setIsRecording(false)
        }
        
        recognition.onerror = (event: any) => {
          let errorMessage = 'Speech recognition error'
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.'
              break
            case 'audio-capture':
              errorMessage = 'Microphone access denied or not available.'
              break
            case 'not-allowed':
              errorMessage = 'Microphone permission denied. Please allow microphone access.'
              break
            case 'network':
              errorMessage = 'Network error. Please check your connection.'
              break
            default:
              errorMessage = `Speech recognition error: ${event.error}`
          }
          onError(errorMessage)
          setIsRecording(false)
        }
        
        recognition.onend = () => {
          setIsRecording(false)
        }
        
        recognitionRef.current = recognition
      } catch (error) {
        setIsSupported(false)
        onError('Failed to initialize speech recognition')
      }
    } else {
      setIsSupported(false)
      onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscription, onError])

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (error) {
        onError('Failed to start speech recognition')
      }
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  if (!isSupported) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Voice Input Not Available</CardTitle>
          <CardDescription>
            Speech recognition is not supported in this browser. Please use a modern browser like Chrome or Edge.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Voice Input</CardTitle>
        <CardDescription>
          Click the microphone to speak your inventory count
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          className="w-24 h-24 rounded-full"
          disabled={!isSupported}
        >
          {isRecording ? (
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-white rounded-full animate-pulse mb-1" />
              <span className="text-xs">Stop</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Speak</span>
            </div>
          )}
        </Button>
        
        {isRecording && (
          <div className="text-center">
            <p className="text-sm text-gray-600 animate-pulse">
              Listening... Speak clearly
            </p>
            <div className="flex justify-center mt-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}