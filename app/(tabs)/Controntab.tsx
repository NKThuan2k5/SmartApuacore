// src/screens/ControlTab.tsx
import { auth, db } from '@/constants/firebaseConfig';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { get, ref, set } from 'firebase/database';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// ✅ Chỉ giữ lại 1 thiết bị "Bơm nước"
const relayDevices = [
  { label: 'Bơm nước', icon: 'engine', color: '#0288d1' },
];

export default function ControlTab() {
  const [relays, setRelays] = useState([false]);
  const animationsRef = useRef([
    {
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0),
      blink: new Animated.Value(1),
      shake: new Animated.Value(0),
    },
  ]);

  const startDeviceAnimation = (index: number) => {
    const anim = animationsRef.current[index];
    anim.rotate.setValue(0);
    anim.blink.setValue(1);
    anim.shake.setValue(0);

    Animated.loop(
      Animated.sequence([
        Animated.timing(anim.blink, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        Animated.timing(anim.blink, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  };

  const toggleRelay = async (index: number) => {
    const newStatus = !relays[index];

    try {
      // Ensure we have an authenticated user (anonymous) — needed if DB rules require auth
      const firebaseAuth = auth || getAuth();
      if (!firebaseAuth.currentUser) {
        await signInAnonymously(firebaseAuth);
        console.log('Signed in anonymously before controlling relay');
      }

  const path = `devices/relay${index + 1}`;
  const relayRef = ref(db, path);

  console.log(`Attempting to write to ${path}`, { uid: firebaseAuth.currentUser?.uid });

  await set(relayRef, { message: newStatus ? 'ON' : 'OFF' });

  // Read back to confirm write succeeded
  const snap = await get(relayRef);
  console.log(`Write result for ${path}:`, snap.exists() ? snap.val() : null);

      const updatedRelays = [...relays];
      updatedRelays[index] = newStatus;
      setRelays(updatedRelays);

      if (newStatus) {
        startDeviceAnimation(index);
      } else {
        animationsRef.current[index] = {
          scale: new Animated.Value(1),
          rotate: new Animated.Value(0),
          blink: new Animated.Value(1),
          shake: new Animated.Value(0),
        };
      }
    } catch (error) {
      console.error(`Lỗi điều khiển relay${index + 1}:`, error);
    }
  };

  const animatePress = (index: number) => {
    const anim = animationsRef.current[index];
    Animated.sequence([
      Animated.timing(anim.scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(anim.scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => toggleRelay(index));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Điều khiển thiết bị</Text>
      <View style={styles.gridContainer}>
        {relays.map((status, index) => {
          const device = relayDevices[index];
          const anim = animationsRef.current[index];
          const spin = anim.rotate.interpolate({
            inputRange: [0, 0.5],
            outputRange: ['0deg', '180deg'],
          });

          return (
            <Pressable key={index} onPress={() => animatePress(index)}>
              <Animated.View
                style={[
                  styles.card,
                  status ? styles.cardOn : styles.cardOff,
                  { transform: [{ scale: anim.scale }] },
                ]}
              >
                <Animated.View
                  style={{
                    transform: [{ rotate: spin }, { translateX: anim.shake }],
                    opacity: anim.blink,
                  }}
                >
                  <MaterialCommunityIcons
                    name={device.icon}
                    size={48}
                    color={status ? device.color : '#b0bec5'}
                  />
                </Animated.View>

                <Text style={[styles.label, status ? styles.textOn : styles.textOff]}>
                  {device.label}
                </Text>
                <FontAwesome
                  name={status ? 'toggle-on' : 'toggle-off'}
                  size={36}
                  color={status ? device.color : '#90a4ae'}
                />
              </Animated.View>
            </Pressable>
          );
        })}
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  gridContainer: {
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  cardOn: {
    borderColor: '#90caf9',
    borderWidth: 2,
  },
  cardOff: {
    borderColor: '#cfd8dc',
    borderWidth: 2,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
  },
  textOn: {
    color: '#37474f',
  },
  textOff: {
    color: '#90a4ae',
  },
});