import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

// Temporary mock data - will be replaced with backend data later
const MOCK_GROUP_PROFILES = [
  {
    id: '1',
    name: 'Weekend Warriors',
    members: [
      {
        id: '1',
        name: 'John Doe',
        age: 29,
        gender: 'male',
        image: 'https://picsum.photos/200/200',
      },
      {
        id: '2',
        name: 'Mike Smith',
        age: 31,
        gender: 'male',
        image: 'https://picsum.photos/200/200',
      },
    ],
    bio: 'Looking for fun double dates!',
    interests: ['Hiking', 'Travel', 'Food'],
    photos: [
      'https://picsum.photos/400/600',
      'https://picsum.photos/400/600',
    ],
  },
  {
    id: '2',
    name: 'Adventure Seekers',
    members: [
      {
        id: '3',
        name: 'Sarah Wilson',
        age: 28,
        gender: 'female',
        image: 'https://picsum.photos/200/200',
      },
      {
        id: '4',
        name: 'Emma Davis',
        age: 27,
        gender: 'female',
        image: 'https://picsum.photos/200/200',
      },
    ],
    bio: 'Love exploring new places together!',
    interests: ['Adventure', 'Photography', 'Coffee'],
    photos: [
      'https://picsum.photos/400/600',
      'https://picsum.photos/400/600',
    ],
  },
];

export default function DiscoverScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState(MOCK_GROUP_PROFILES);
  const position = useRef(new Animated.ValueXY()).current;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        const direction = translationX > 0 ? 'right' : 'left';
        handleSwipe(direction);
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(prev => prev + 1);
      setCurrentPhotoIndex(0);
    });
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-30deg', '0deg', '30deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.container}>
        <FontAwesome name="compass" size={64} color="#999" />
        <Text style={styles.title}>No more groups to show!</Text>
        <Text style={styles.subtitle}>Check back later for new matches!</Text>
      </View>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View style={[styles.card, getCardStyle()]}>
          <View style={styles.imageContainer}>
            <TouchableOpacity 
              onPress={() => setCurrentPhotoIndex(prev => 
                prev === currentProfile.photos.length - 1 ? 0 : prev + 1
              )}
            >
              <Image 
                source={{ uri: currentProfile.photos[currentPhotoIndex] }} 
                style={styles.image}
              />
            </TouchableOpacity>
            <View style={styles.photoIndicator}>
              {currentProfile.photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.photoDot,
                    index === currentPhotoIndex && styles.photoDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.groupName}>{currentProfile.name}</Text>
            <View style={styles.membersContainer}>
              {currentProfile.members.map((member) => (
                <View key={member.id} style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}, {member.age}</Text>
                  <Text style={styles.memberGender}>{member.gender}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.bio}>{currentProfile.bio}</Text>
            <View style={styles.interestsContainer}>
              {currentProfile.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => handleSwipe('left')}
          style={[styles.button, styles.nopeButton]}
        >
          <FontAwesome name="times" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSwipe('right')}
          style={[styles.button, styles.likeButton]}
        >
          <FontAwesome name="heart" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: Dimensions.get('window').height * 0.7,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  photoIndicator: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  photoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  photoDotActive: {
    backgroundColor: 'white',
  },
  profileInfo: {
    padding: 20,
    backgroundColor: 'white',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  membersContainer: {
    marginBottom: 12,
  },
  memberInfo: {
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberGender: {
    fontSize: 14,
    color: '#666',
  },
  bio: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#333',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nopeButton: {
    backgroundColor: '#ff4d4d',
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
}); 