/**
 * @fileoverview 语音输入组件 - 支持录音、可视化、播放控制
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

'use client';

import * as React from 'react';
import { Mic, MicOff, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

export interface VoiceMessage {
  id: string;
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
  timestamp: number;
}

interface VoiceInputProps {
  onVoiceRecorded?: (voiceMessage: VoiceMessage) => void;
  className?: string;
}

const MAX_RECORDING_DURATION = 60; // 最大录制时长（秒）

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onVoiceRecorded,
  className = ''
}) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [audioLevel, setAudioLevel] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1.0);
  const [playbackProgress, setPlaybackProgress] = React.useState(0);
  const [recordedAudio, setRecordedAudio] = React.useState<VoiceMessage | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const audioElementRef = React.useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = React.useRef<number | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const voiceMessage: VoiceMessage = {
          id: Date.now().toString(),
          audioBlob,
          audioUrl,
          duration: recordingTime,
          timestamp: Date.now()
        };

        setRecordedAudio(voiceMessage);
        
        if (onVoiceRecorded) {
          onVoiceRecorded(voiceMessage);
        }

        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setPlaybackProgress(0);

      // 开始计时
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_DURATION) {
            stopRecording();
            return MAX_RECORDING_DURATION;
          }
          return prev + 0.1;
        });
      }, 100);

      // 开始音频可视化
      visualizeAudio();

    } catch (error) {
      console.error('无法访问麦克风:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const draw = () => {
      if (!isRecording) return;

      analyserRef.current!.getByteFrequencyData(dataArray);
      
      // 计算平均音量
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const handlePlayPause = () => {
    if (!recordedAudio) return;

    if (isPlaying) {
      audioElementRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = speed;
    }
  };

  const handleTimeUpdate = () => {
    if (audioElementRef.current && recordedAudio) {
      const progress = (audioElementRef.current.currentTime / recordedAudio.duration) * 100;
      setPlaybackProgress(progress);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setPlaybackProgress(0);
  };

  const handleReset = () => {
    setRecordedAudio(null);
    setRecordingTime(0);
    setPlaybackProgress(0);
    setIsPlaying(false);
    setPlaybackSpeed(1.0);
  };

  React.useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* 录制控制区 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {!isRecording && !recordedAudio && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Mic className="w-5 h-5" />
              开始录音
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <MicOff className="w-5 h-5" />
              停止录音
            </button>
          )}

          {recordedAudio && !isRecording && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              重新录制
            </button>
          )}
        </div>

        <div className="text-2xl font-mono text-gray-700">
          {formatTime(recordingTime)}
        </div>
      </div>

      {/* 音频可视化 */}
      {isRecording && (
        <div className="mb-4">
          <div className="flex items-center gap-1 h-16 bg-gray-100 rounded-lg p-2">
            {[...Array(32)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-indigo-500 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(4, audioLevel * 100 * Math.random())}%`,
                  opacity: 0.7 + audioLevel * 0.3
                }}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            录制中... {Math.round(recordingTime)} / {MAX_RECORDING_DURATION} 秒
          </div>
        </div>
      )}

      {/* 录制完成后的播放控制 */}
      {recordedAudio && !isRecording && (
        <div className="space-y-4">
          {/* 音频播放器 */}
          <audio
            ref={audioElementRef}
            src={recordedAudio.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            className="hidden"
          />

          {/* 播放控制 */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-gray-500" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-100"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {formatTime(recordedAudio.duration)}
                </span>
              </div>
            </div>
          </div>

          {/* 播放速度控制 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">播放速度:</span>
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* 音频信息 */}
          <div className="text-sm text-gray-500">
            录制时长: {formatTime(recordedAudio.duration)} | 
            文件大小: {(recordedAudio.audioBlob.size / 1024).toFixed(1)} KB
          </div>
        </div>
      )}

      {/* 录制提示 */}
      {!isRecording && !recordedAudio && (
        <div className="text-center text-sm text-gray-500">
          点击"开始录音"按钮开始录制语音消息，最长 {MAX_RECORDING_DURATION} 秒
        </div>
      )}
    </div>
  );
};

VoiceInput.displayName = 'VoiceInput';

export default VoiceInput;