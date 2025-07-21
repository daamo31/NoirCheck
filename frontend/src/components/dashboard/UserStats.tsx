/**
 * User Stats Component
 * 
 * Displays comprehensive user statistics and analytics including charts,
 * metrics, and insights about user activity on the NoirCheck platform.
 * 
 * Features:
 * - Visual charts for activity trends
 * - Key performance metrics
 * - Activity breakdown by type
 * - Recent activity summary
 * - Interactive refresh functionality
 * - Loading states and error handling
 */

'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  FileCheck,
  Shield,
  Award,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import type { UserStats as UserStatsType } from '@/services/api';

interface UserStatsProps {
  userStats: UserStatsType | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function UserStats({ userStats, isLoading, onRefresh }: UserStatsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Could not load statistics
        </p>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </button>
      </div>
    );
  }

  const mainStats = [
    {
      label: 'Registered Content',
      value: userStats.totalRegistrations,
      icon: <FileCheck className="w-6 h-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Verifications Made',
      value: userStats.totalVerifications,
      icon: <Shield className="w-6 h-6" />,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      change: '+8%',
      trend: 'up'
    },
    {
      label: 'Recent Activity',
      value: userStats.recentActivity.length,
      icon: <Calendar className="w-6 h-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      change: '+5%',
      trend: 'up'
    },
    {
      label: 'Trust Score',
      value: Math.round((userStats.totalRegistrations + userStats.totalVerifications) * 0.95),
      icon: <Award className="w-6 h-6" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      change: '+3%',
      trend: 'up'
    }
  ];

  const achievements = [
    {
      title: 'First Registration',
      description: 'You registered your first content',
      earned: userStats.totalRegistrations > 0,
      icon: '🎯'
    },
    {
      title: 'Active Verifier',
      description: 'Made more than 10 verifications',
      earned: userStats.totalVerifications >= 10,
      icon: '🔍'
    },
    {
      title: 'Contributor',
      description: 'Registered more than 5 contents',
      earned: userStats.totalRegistrations >= 5,
      icon: '📝'
    },
    {
      title: 'Veteran User',
      description: 'Member for more than 30 days',
      earned: new Date().getTime() - new Date(userStats.joinDate).getTime() > 30 * 24 * 60 * 60 * 1000,
      icon: '⭐'
    }
  ];

  const recentActivityByType = userStats.recentActivity.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Activity Analysis
        </h3>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="week">Last week</option>
            <option value="month">Last month</option>
            <option value="year">Last year</option>
          </select>
          
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg border ${stat.bgColor} ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color}`}>
                {stat.icon}
              </div>
              <div className={`flex items-center text-sm ${
                stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Activity Distribution
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activity Types */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              By Activity Type
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Registrations</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {recentActivityByType.registration || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Verifications</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {recentActivityByType.verification || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Recent Activity
            </h5>
            <div className="space-y-2">
              {userStats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      activity.type === 'registration' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-32">
                      {activity.filename}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Achievements and Recognition
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.earned
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h5 className={`font-medium ${
                    achievement.earned 
                      ? 'text-green-800 dark:text-green-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {achievement.title}
                  </h5>
                  <p className={`text-sm ${
                    achievement.earned 
                      ? 'text-green-600 dark:text-green-500' 
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <div className="flex-shrink-0">
                    <Award className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals and Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Goals and Progress
        </h4>
        
        <div className="space-y-4">
          {/* Registration Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Registrations (Goal: 10)
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {userStats.totalRegistrations}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((userStats.totalRegistrations / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Verification Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Verifications (Goal: 25)
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {userStats.totalVerifications}/25
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((userStats.totalVerifications / 25) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
