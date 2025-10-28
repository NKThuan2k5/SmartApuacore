import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSensorData } from '../../hooks/useFirebaseSync';
interface SensorData {
  TEMPERATURE: number;
  pHvalue: number;
  TDS: number;
  density?: number; // Thêm trường mật độ
}

export default function HomeScreen() {
  const { data: systemData, loading, error, isOnline, lastUpdate } = useSensorData();

  // State để nhập mật độ ao nuôi
  const [density, setDensity] = useState<number>(0);

  // Transform the new data structure to match your existing interface
  const sensorData: SensorData = {
    TEMPERATURE: systemData?.water.temp || 0,
    pHvalue: systemData?.water.ph || 0,
    TDS: systemData?.water.tds || 0,
    density: density, // Lấy từ state
  };

  const sensorIcons: Record<keyof SensorData, string> = {
    TEMPERATURE: 'thermometer',
    pHvalue: 'water',
    TDS: 'test-tube',
    density: 'account-group', // icon cho mật độ
  };

  const sensorColors: Record<keyof SensorData, string> = {
    TEMPERATURE: '#ff5722',
    pHvalue: '#2196f3',
    TDS: '#3f51b5',
    density: '#607d8b', // màu cho mật độ
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
        <Text style={styles.headerText}>Hệ thống giám sát </Text>
        {/* Nhập mật độ ao nuôi */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={{ fontSize: 16, color: '#333', marginRight: 8 }}>Mật độ ao nuôi:</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 4,
              padding: 4,
              width: 80,
              textAlign: 'center',
              marginRight: 4,
            }}
            keyboardType="numeric"
            value={density.toString()}
            onChangeText={text => setDensity(Number(text.replace(/[^0-9.]/g, '')))}
            placeholder="con/m²"
          />
          <Text style={{ fontSize: 16, color: '#333' }}>con/m²</Text>
        </View>
        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4caf50' : '#f44336' }]} />
          <Text style={styles.statusText}>
            {isOnline ? 'Kết nối' : 'Mất kết nối'} 
            {lastUpdate && ` • ${lastUpdate.toLocaleTimeString('vi-VN')}`}
          </Text>
        </View>
        
        {error && (
          <Text style={styles.errorText}>⚠️ {error}</Text>
        )}
        
        {loading && (
          <Text style={styles.loadingText}>🔄 Đang tải dữ liệu...</Text>
        )}
      </View>

      <View style={styles.sensorGrid}>
        {Object.entries(sensorData).map(([key, value]) => (
          <View
            key={key}
            style={[styles.sensorCard, { borderColor: sensorColors[key as keyof SensorData] }]}
          >
            <MaterialCommunityIcons
              name={sensorIcons[key as keyof SensorData]}
              size={32}
              color={sensorColors[key as keyof SensorData]}
              style={styles.sensorIcon}
            />
            <Text style={styles.sensorTitle}>{key}</Text>
            <Text style={styles.sensorValue}>
              {value.toFixed(2)}{' '}
              {key === 'TEMPERATURE' && '°C'}
              {key === 'pHvalue' && ''}
              {key === 'TubydityValue' && ' NTU'}
              {key === 'TDS' && ' ppm'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 12,
    color: '#2196f3',
    textAlign: 'center',
    marginTop: 4,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 2,
    // Use platform-specific shadow styles: web uses boxShadow, native uses elevation/shadow*
    ...(Platform.select({
      web: {
        // React Native Web: prefer CSS boxShadow
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }) as object),
    alignItems: 'center',
  },
  sensorIcon: {
    marginBottom: 8,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});