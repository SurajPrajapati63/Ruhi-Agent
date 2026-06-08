import React, { useEffect, useState, useRef } from 'react';
import { FiMic, FiStopCircle } from 'react-icons/fi';
import { apiClient } from '../services/api';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

const VoiceInput = ({ className, onTranscriptChange, onVoiceSubmit }) => {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(!!SpeechRecognition);
  const [, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const pendingSubmitRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  const onVoiceSubmitRef = useRef(onVoiceSubmit);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
    onVoiceSubmitRef.current = onVoiceSubmit;
  }, [onTranscriptChange, onVoiceSubmit]);

  useEffect(() => {
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = true;
    recog.continuous = true;
    recog.maxAlternatives = 1;

    recog.onresult = (event) => {
      let combined = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        combined += res[0].transcript;
      }
      transcriptRef.current = combined;
      setTranscript(combined);
      if (onTranscriptChangeRef.current) {
        onTranscriptChangeRef.current(combined);
      }
    };

    recog.onerror = (e) => {
      console.warn('Speech recognition error', e);
      setListening(false);
      pendingSubmitRef.current = false;
    };

    recog.onend = async () => {
      setListening(false);
      const finalTranscript = transcriptRef.current.trim();
      if (pendingSubmitRef.current && finalTranscript) {
        pendingSubmitRef.current = false;
        if (onVoiceSubmitRef.current) {
          await onVoiceSubmitRef.current(finalTranscript);
        }
        setTranscript('');
        transcriptRef.current = '';
        if (onTranscriptChangeRef.current) {
          onTranscriptChangeRef.current('');
        }
      } else {
        pendingSubmitRef.current = false;
      }
    };

    recognitionRef.current = recog;
    setSupported(true);

    return () => {
      try {
        recog.onresult = null;
        recog.onerror = null;
        recog.onend = null;
        recog.stop();
      } catch (e) {}
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    if (onTranscriptChange) {
      onTranscriptChange('');
    }
    pendingSubmitRef.current = true;
    try {
      // start SpeechRecognition
      recognitionRef.current.start();
      // also start recording raw audio to send to backend as a fallback / persist
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        streamRef.current = stream;
        try {
          const mr = new MediaRecorder(stream);
          audioChunksRef.current = [];
          mr.ondataavailable = (e) => {
            if (e.data && e.data.size) audioChunksRef.current.push(e.data);
          };
          mr.start();
          mediaRecorderRef.current = mr;
        } catch (err) {
          console.warn('MediaRecorder start failed', err);
        }
      }).catch((err) => {
        console.warn('getUserMedia failed', err);
      });
      setListening(true);
    } catch (e) {
      console.warn('start error', e);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      // stop media recorder and upload audio to backend
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.onstop = async () => {
          try {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const form = new FormData();
            form.append('audio', blob, 'voice.webm');
            const resp = await apiClient.post('/upload/audio', form, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            const serverTranscript = resp.data?.transcript;
            if (serverTranscript && onVoiceSubmitRef.current) {
              await onVoiceSubmitRef.current(serverTranscript);
            }
          } catch (err) {
            console.warn('Audio upload failed', err);
          } finally {
            // cleanup stream
            try {
              streamRef.current?.getTracks()?.forEach((t) => t.stop());
            } catch (e) {}
            mediaRecorderRef.current = null;
            audioChunksRef.current = [];
            streamRef.current = null;
          }
        };
      } else {
        try {
          streamRef.current?.getTracks()?.forEach((t) => t.stop());
        } catch (e) {}
      }
    } catch (e) {
      console.warn('stop error', e);
    }
    setListening(false);
  };

  if (!supported) return null;

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleButtonClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-md ${listening ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200'}`}
      >
        {listening ? <FiStopCircle size={18} /> : <FiMic size={18} />}
        <span className="text-sm">{listening ? 'Stop' : 'Voice'}</span>
      </button>
    </div>
  );
};

export default VoiceInput;
