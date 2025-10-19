import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
  style?: ViewStyle;
}

export default function Logo({ size = 'medium', variant = 'light', style }: LogoProps) {
  const sizeConfig = {
    small: { fontSize: 24, subtitleSize: 10, lineWidth: 40, spacing: 8 },
    medium: { fontSize: 32, subtitleSize: 12, lineWidth: 60, spacing: 10 },
    large: { fontSize: 48, subtitleSize: 14, lineWidth: 80, spacing: 12 },
  };

  const colors = {
    light: { 
      main: '#2F2F5F',
      subtitle: '#666666',
    },
    dark: { 
      main: '#FFFFFF',
      subtitle: '#CCCCCC',
    },
  };

  const config = sizeConfig[size];
  const colorScheme = colors[variant];

  return (
    <View style={[styles.container, style]}>
      <Text style={[
        styles.mainText, 
        { 
          fontSize: config.fontSize, 
          color: colorScheme.main,
          fontWeight: '800',
          letterSpacing: config.fontSize * 0.05,
        }
      ]}>
        TOVALI
      </Text>
      
      <View style={[styles.lineContainer, { marginTop: config.fontSize * 0.15 }]}>
        <View style={[
          styles.line, 
          { 
            width: config.lineWidth, 
            backgroundColor: colorScheme.main,
            height: 2
          }
        ]} />
        <Text style={[
          styles.subtitle, 
          { 
            fontSize: config.subtitleSize, 
            color: colorScheme.subtitle, 
            marginHorizontal: config.spacing,
            letterSpacing: config.subtitleSize * 0.2
          }
        ]}>
          YOUR EVERYDAY SERVICES
        </Text>
        <View style={[
          styles.line, 
          { 
            width: config.lineWidth, 
            backgroundColor: colorScheme.main,
            height: 2
          }
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainText: {
    textAlign: 'center',
    fontFamily: 'System',
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    backgroundColor: '#2F2F5F',
  },
  subtitle: {
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'System',
  },
});
