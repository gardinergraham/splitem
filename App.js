import { StatusBar } from "expo-status-bar";
import * as MediaLibrary from "expo-media-library";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import ViewShot from "react-native-view-shot";

const assets = {
  logo: require("./assets/logo.png"),
  about: require("./assets/about.png"),
  camera: require("./assets/camera.png"),
  menu: require("./assets/menu.png"),
  backgrounds: [
    require("./assets/back12.png"),
    require("./assets/back2.png"),
    require("./assets/back3.png"),
    require("./assets/back5.png"),
    require("./assets/back6.png"),
    require("./assets/back8.png"),
    require("./assets/back1.png"),
    require("./assets/back13.png")
  ],
  heads: [
    require("./assets/head1.png"),
    require("./assets/head2.png"),
    require("./assets/head3.png"),
    require("./assets/head4.png"),
    require("./assets/head5.png"),
    require("./assets/head6.png"),
    require("./assets/head7.png"),
    require("./assets/head8.png"),
    require("./assets/head9.png"),
    require("./assets/head10.png"),
    require("./assets/head11.png"),
    require("./assets/head12.png"),
    require("./assets/head13.png"),
    require("./assets/head14.png"),
    require("./assets/head15.png")
  ],
  bodies: [
    require("./assets/body1.png"),
    require("./assets/body2.png"),
    require("./assets/body3.png"),
    require("./assets/body4.png"),
    require("./assets/body5.png"),
    require("./assets/body6.png"),
    require("./assets/body7.png"),
    require("./assets/body8.png"),
    require("./assets/body9.png"),
    require("./assets/body10.png"),
    require("./assets/body11.png"),
    require("./assets/body12.png"),
    require("./assets/body13.png"),
    require("./assets/body14.png"),
    require("./assets/body15.png")
  ],
  legs: [
    require("./assets/legs1.png"),
    require("./assets/legs2.png"),
    require("./assets/legs3.png"),
    require("./assets/legs4.png"),
    require("./assets/legs5.png"),
    require("./assets/legs6.png"),
    require("./assets/legs7.png"),
    require("./assets/legs8.png"),
    require("./assets/legs9.png"),
    require("./assets/legs10.png"),
    require("./assets/legs11.png"),
    require("./assets/legs12.png"),
    require("./assets/legs13.png"),
    require("./assets/legs14.png"),
    require("./assets/legs15.png")
  ],
  dressPeople: [
    require("./SplitClothes/processed/Boy1.png"),
    require("./SplitClothes/processed/Boy2.png"),
    require("./SplitClothes/processed/Boy3.png"),
    require("./SplitClothes/processed/Girl1.png"),
    require("./SplitClothes/processed/Girl2.png"),
    require("./SplitClothes/processed/Girl3.png")
  ],
  dressHats: [
    require("./SplitClothes/processed/Hat1.png"),
    require("./SplitClothes/processed/Hat2.png"),
    require("./SplitClothes/processed/Hat3.png"),
    require("./SplitClothes/processed/Hat4.png"),
    require("./SplitClothes/processed/Hat5.png"),
    require("./SplitClothes/processed/Hat6.png"),
    require("./SplitClothes/processed/Hat7.png"),
    require("./SplitClothes/processed/Hat8.png"),
    require("./SplitClothes/processed/Hat9.png"),
    require("./SplitClothes/processed/Hat10.png")
  ],
  dressShirts: [
    require("./SplitClothes/processed/Shirt11.png"),
    require("./SplitClothes/processed/Shirt12.png"),
    require("./SplitClothes/processed/Shirt13.png"),
    require("./SplitClothes/processed/Shirt14.png"),
    require("./SplitClothes/processed/Shirt15.png"),
    require("./SplitClothes/processed/Shirt16.png"),
    require("./SplitClothes/processed/Shirt17.png"),
    require("./SplitClothes/processed/Shirt18.png"),
    require("./SplitClothes/processed/Shirt19.png"),
    require("./SplitClothes/processed/Shirt206.png"),
    require("./SplitClothes/processed/Shirt201.png"),
    require("./SplitClothes/processed/Shirt20.png")
  ],
  dressTrousers: [
    require("./SplitClothes/processed/Trousers1.png"),
    require("./SplitClothes/processed/Trousers2.png"),
    require("./SplitClothes/processed/Trousers3.png"),
    require("./SplitClothes/processed/Trousers4.png"),
    require("./SplitClothes/processed/Trousers5.png"),
    require("./SplitClothes/processed/Trousers6.png"),
    require("./SplitClothes/processed/Trousers7.png"),
    require("./SplitClothes/processed/Trousers8.png"),
    require("./SplitClothes/processed/Trousers9.png"),
    require("./SplitClothes/processed/Trousers10.png")
  ],
  dressShoes: [
    require("./SplitClothes/processed/Shoes1.png"),
    require("./SplitClothes/processed/Shoes12.png"),
    require("./SplitClothes/processed/Shoes13.png"),
    require("./SplitClothes/processed/Shoes14.png"),
    require("./SplitClothes/processed/Shoes15.png"),
    require("./SplitClothes/processed/Shoes16.png"),
    require("./SplitClothes/processed/Shoes17.png"),
    require("./SplitClothes/processed/Shoes18.png"),
    require("./SplitClothes/processed/Shoes19.png"),
    require("./SplitClothes/processed/Shoes20.png")
  ]
};

const CANVAS = { width: 320, height: 480 };
const DRESS_FRAMES = {
  person: { x: 35, y: 56, width: 250, height: 374 },
  hat: { x: 91, y: 18, width: 138, height: 84 },
  shirt: { x: 51, y: 194, width: 217, height: 145 },
  trousers: { x: 69, y: 274, width: 180, height: 148 },
  shoes: { x: 20, y: 372, width: 280, height: 70 }
};

const headNameParts = [
  { title: "Diver", openers: ["Bubble", "Deep-Sea", "Captain"], roots: ["Splash", "Helmet", "Flipper"] },
  { title: "Pirate", openers: ["Captain", "Blackbeard", "Pegleg"], roots: ["Beard", "Booty", "Parrot"] },
  { title: "Gangster", openers: ["Sneaky", "Stripey", "Boss"], roots: ["Grin", "Fedora", "Shuffle"] },
  { title: "Princess", openers: ["Princess", "Twinkle", "Royal"], roots: ["Sparkle", "Curtsy", "Crown"] },
  { title: "Cow", openers: ["Sheriff", "Moo", "Wild-West"], roots: ["Horns", "Hoof", "Rodeo"] },
  { title: "Chef", openers: ["Chef", "Saucy", "Souffle"], roots: ["Whiskers", "Noodles", "Pudding"] },
  { title: "Bagpiper", openers: ["Highland", "Tooty", "Piper"], roots: ["McToot", "Tartan", "Bagpipes"] },
  { title: "Ballerina", openers: ["Twinkle", "Prima", "Tippy-Toe"], roots: ["Spin", "Tutu", "Pirouette"] },
  { title: "Yo-Yo Kid", openers: ["Yo-Yo", "Whizzy", "Looping"], roots: ["Spinner", "String", "Zoom"] },
  { title: "Robot", openers: ["Robo", "Clanky", "Bolt"], roots: ["Beep", "Gear", "Widget"] },
  { title: "Nurse", openers: ["Nurse", "Helpful", "Bandage"], roots: ["Care", "Patch", "Plaster"] },
  { title: "Teddy", openers: ["Teddy", "Cuddle", "Fuzzy"], roots: ["Bear", "Snuggle", "Button"] },
  { title: "Dentist", openers: ["Doctor", "Toothy", "Smiley"], roots: ["Brush", "Molar", "Grin"] },
  { title: "Flower Girl", openers: ["Daisy", "Sunny", "Flower"], roots: ["Petal", "Pigtail", "Giggle"] },
  { title: "Clown", openers: ["Bouncy", "Silly", "Jolly"], roots: ["Giggles", "Nose", "Whoopee"] }
];

const bodyNameParts = [
  { action: "dives", middles: ["Bubble", "Wetsuit", "Wave"] },
  { action: "swashbuckles", middles: ["Dagger", "Jacket", "Treasure"] },
  { action: "sneaks", middles: ["Stripe", "Tie", "Suit"] },
  { action: "curtsies", middles: ["Royal", "Fan", "Frock"] },
  { action: "rounds up", middles: ["Sheriff", "Lasso", "Vest"] },
  { action: "stirs", middles: ["Mixing-Bowl", "Pancake", "Spoon"] },
  { action: "pipes", middles: ["Tartan", "Bagpipe", "Highland"] },
  { action: "twirls", middles: ["Ballet", "Tutu", "Ribbon"] },
  { action: "yo-yos", middles: ["Loop", "Trick", "K"] },
  { action: "beeps", middles: ["Metal", "Coffee", "Button"] },
  { action: "helps", middles: ["Nurse", "Clinic", "Kind"] },
  { action: "cuddles", middles: ["Cuddle", "Bow-Tie", "Fuzzy"] },
  { action: "brushes", middles: ["Toothpaste", "Smile", "Dentist"] },
  { action: "giggles", middles: ["Flower", "Pink", "Daisy"] },
  { action: "honks", middles: ["Clown", "Bow", "Circus"] }
];

const legNameParts = [
  { endings: ["Boots", "Flippers", "Stomps"] },
  { endings: ["Peglegs", "Sea-Boots", "Wobbles"] },
  { endings: ["Stripelegs", "Tap-Shoes", "Shuffle"] },
  { endings: ["Princess-Toes", "Slippers", "Skirts"] },
  { endings: ["Cowboy-Boots", "Spurs", "Gallops"] },
  { endings: ["Chef-Pants", "Sneakers", "Checkers"] },
  { endings: ["Kilt-Knees", "Marches", "Tartan-Toes"] },
  { endings: ["Tippytoes", "Ballet-Shoes", "Twirls"] },
  { endings: ["Yo-Yo-Toes", "Zoomers", "Trainers"] },
  { endings: ["Robo-Legs", "Clankers", "Bolts"] },
  { endings: ["Nurse-Shoes", "Kind-Steps", "Clip-Clops"] },
  { endings: ["Bear-Bottoms", "Cuddle-Feet", "Paws"] },
  { endings: ["Toothy-Toes", "Polishers", "Smile-Steps"] },
  { endings: ["Flower-Socks", "Blue-Toes", "Daisy-Steps"] },
  { endings: ["Clown-Shoes", "Bouncy-Pants", "Big-Steps"] }
];

function choose(options, seed) {
  return options[Math.abs(seed) % options.length];
}

function makeCharacterName(headIndex, bodyIndex, legsIndex) {
  const head = headNameParts[headIndex];
  const body = bodyNameParts[bodyIndex];
  const legs = legNameParts[legsIndex];
  const seed = headIndex * 31 + bodyIndex * 17 + legsIndex * 13;

  return `${choose(head.openers, seed)} ${choose(body.middles, seed + 1)}-${choose(
    legs.endings,
    seed + 2
  )}`;
}

function findVoiceForMode(voices, mode) {
  const preferredLanguageVoices = voices.filter((voice) => voice.language?.toLowerCase().startsWith("en"));
  const candidates = preferredLanguageVoices.length > 0 ? preferredLanguageVoices : voices;
  const maleNames = ["daniel", "arthur", "oliver", "george", "fred", "alex", "tom", "matthew", "male"];
  const femaleNames = ["martha", "samantha", "karen", "serena", "moira", "tessa", "victoria", "female"];
  const names = mode === "low" ? maleNames : femaleNames;

  return candidates.find((voice) => names.some((name) => voice.name?.toLowerCase().includes(name)));
}

function speechSettingsForMode(mode, selectedVoice) {
  return {
    language: "en-GB",
    pitch: mode === "low" ? 0.72 : 1.42,
    rate: mode === "low" ? 0.78 : 0.9,
    voice: selectedVoice?.identifier
  };
}

function useSaveToPhotos(shotRef, label) {
  return useCallback(async () => {
    const permission = await MediaLibrary.requestPermissionsAsync(true);
    if (!permission.granted) {
      Alert.alert("Photos permission needed", "Allow photo access to save your Splitem image.");
      return;
    }

    const uri = await shotRef.current?.capture?.();
    if (!uri) {
      Alert.alert("Save failed", "The image was not ready to save.");
      return;
    }

    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert("Saved", `Your ${label} image has been saved to Photos.`);
  }, [label, shotRef]);
}

export default function App() {
  const [screen, setScreen] = useState("menu");

  return (
    <View style={styles.app}>
      <StatusBar hidden />
      {screen === "menu" && (
        <MenuScreen
          onPlay={() => setScreen("play")}
          onDress={() => setScreen("dress")}
          onAbout={() => setScreen("about")}
        />
      )}
      {screen === "about" && <AboutScreen onClose={() => setScreen("menu")} />}
      {screen === "play" && <PlayScreen onClose={() => setScreen("menu")} />}
      {screen === "dress" && <DressEmScreen onClose={() => setScreen("menu")} />}
    </View>
  );
}

function MenuScreen({ onPlay, onDress, onAbout }) {
  const { width, height } = useWindowDimensions();
  const logoWidth = Math.min(width - 32, height * 0.55 * (784 / 1168));

  return (
    <View style={styles.homeScreen}>
      <SafeAreaView style={styles.homeSafeArea}>
        <View style={styles.homeLogoArea}>
          <Image
            source={assets.logo}
            resizeMode="contain"
            style={[
              styles.homeLogo,
              {
                width: logoWidth,
                height: logoWidth * (1168 / 784)
              }
            ]}
          />
        </View>
        <View style={styles.homeButtons}>
          <HomeButton title="Split-em" onPress={onPlay} primary />
          <HomeButton title="Dress-Em" onPress={onDress} />
          <HomeButton title="About" onPress={onAbout} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function AboutScreen({ onClose }) {
  return (
    <ImageBackground source={assets.about} resizeMode="cover" style={styles.fullScreen}>
      <SafeAreaView style={styles.safeOverlay}>
        <ImageButton source={assets.menu} label="Close" onPress={onClose} />
      </SafeAreaView>
    </ImageBackground>
  );
}

function PlayScreen({ onClose }) {
  const shotRef = useRef(null);
  const [headIndex, setHeadIndex] = useState(0);
  const [bodyIndex, setBodyIndex] = useState(0);
  const [legsIndex, setLegsIndex] = useState(0);
  const [voiceMode, setVoiceMode] = useState("happy");
  const [availableVoices, setAvailableVoices] = useState([]);
  const { width, height } = useWindowDimensions();
  const canvasSize = useMemo(() => {
    const scale = Math.min(width / CANVAS.width, height / CANVAS.height);
    return {
      width: CANVAS.width * scale,
      height: CANVAS.height * scale,
      scale
    };
  }, [height, width]);
  const characterName = useMemo(
    () => makeCharacterName(headIndex, bodyIndex, legsIndex),
    [bodyIndex, headIndex, legsIndex]
  );
  const selectedVoice = useMemo(
    () => findVoiceForMode(availableVoices, voiceMode),
    [availableVoices, voiceMode]
  );
  const speakCharacterName = useCallback(() => {
    Speech.stop();
    Speech.speak(`My name is ${characterName}`, speechSettingsForMode(voiceMode, selectedVoice));
  }, [characterName, selectedVoice, voiceMode]);
  const saveImage = useSaveToPhotos(shotRef, "Splitem");

  useEffect(() => {
    let mounted = true;
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        if (mounted) {
          setAvailableVoices(voices);
        }
      })
      .catch(() => {
        if (mounted) {
          setAvailableVoices([]);
        }
      });

    return () => {
      mounted = false;
      Speech.stop();
    };
  }, []);

  return (
    <View style={styles.playScreen}>
      <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }} style={[styles.canvas, canvasSize]}>
        <LayerPager images={assets.backgrounds} frame={{ x: 0, y: 0, width: 320, height: 480 }} scale={canvasSize.scale} />
        <LayerPager
          images={assets.legs}
          frame={{ x: 20, y: 274, width: 280, height: 150 }}
          scale={canvasSize.scale}
          onIndexChange={setLegsIndex}
        />
        <LayerPager
          images={assets.bodies}
          frame={{ x: 12, y: 125, width: 296, height: 182 }}
          scale={canvasSize.scale}
          onIndexChange={setBodyIndex}
        />
        <LayerPager
          images={assets.heads}
          frame={{ x: 20, y: 24, width: 280, height: 132 }}
          scale={canvasSize.scale}
          onIndexChange={setHeadIndex}
        />
      </ViewShot>

      <SafeAreaView pointerEvents="box-none" style={styles.controls}>
        <ImageButton source={assets.menu} label="Menu" onPress={onClose} />
        <View style={styles.nameArea}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Say ${characterName}`}
            onPress={speakCharacterName}
            style={styles.nameBadge}
          >
            <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.characterName}>
              {characterName}
            </Text>
          </Pressable>
          <View style={styles.voiceToggle}>
            <VoiceChoice label="Low" selected={voiceMode === "low"} onPress={() => setVoiceMode("low")} />
            <VoiceChoice label="Happy" selected={voiceMode === "happy"} onPress={() => setVoiceMode("happy")} />
          </View>
        </View>
        <ImageButton source={assets.camera} label="Save to Photos" onPress={saveImage} />
      </SafeAreaView>
    </View>
  );
}

function DressEmScreen({ onClose }) {
  const shotRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const saveImage = useSaveToPhotos(shotRef, "Dress-Em");
  const canvasSize = useMemo(() => {
    const scale = Math.min(width / CANVAS.width, height / CANVAS.height);
    return {
      width: CANVAS.width * scale,
      height: CANVAS.height * scale,
      scale
    };
  }, [height, width]);

  return (
    <View style={styles.playScreen}>
      <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }} style={[styles.canvas, styles.dressCanvas, canvasSize]}>
        <View style={[styles.dressPaper, { width: canvasSize.width, height: canvasSize.height }]} />
        <LayerPager
          images={assets.dressPeople}
          frame={DRESS_FRAMES.person}
          scale={canvasSize.scale}
          resizeMode="contain"
        />
        <LayerPager
          images={assets.dressTrousers}
          frame={DRESS_FRAMES.trousers}
          scale={canvasSize.scale}
          resizeMode="contain"
        />
        <LayerPager
          images={assets.dressShirts}
          frame={DRESS_FRAMES.shirt}
          scale={canvasSize.scale}
          resizeMode="contain"
        />
        <LayerPager images={assets.dressShoes} frame={DRESS_FRAMES.shoes} scale={canvasSize.scale} resizeMode="contain" />
        <LayerPager images={assets.dressHats} frame={DRESS_FRAMES.hat} scale={canvasSize.scale} resizeMode="contain" />
      </ViewShot>

      <SafeAreaView pointerEvents="box-none" style={styles.controls}>
        <ImageButton source={assets.menu} label="Menu" onPress={onClose} />
        <View pointerEvents="none" style={styles.screenBadge}>
          <Text style={styles.screenBadgeText}>Dress-Em</Text>
        </View>
        <ImageButton source={assets.camera} label="Save to Photos" onPress={saveImage} />
      </SafeAreaView>
    </View>
  );
}

function LayerPager({ images, frame, scale, onIndexChange, resizeMode = "stretch" }) {
  const ref = useRef(null);
  const loopingImages = useMemo(() => [images[images.length - 1], ...images, images[0]], [images]);
  const width = frame.width * scale;
  const height = frame.height * scale;

  const jumpToFirstRealPage = useCallback(() => {
    requestAnimationFrame(() => {
      ref.current?.scrollTo({ x: width, y: 0, animated: false });
    });
  }, [width]);

  const handleMomentumEnd = useCallback(
    (event) => {
      const page = Math.round(event.nativeEvent.contentOffset.x / width);
      if (page === 0) {
        ref.current?.scrollTo({ x: width * images.length, y: 0, animated: false });
        onIndexChange?.(images.length - 1);
      } else if (page === images.length + 1) {
        ref.current?.scrollTo({ x: width, y: 0, animated: false });
        onIndexChange?.(0);
      } else {
        onIndexChange?.(page - 1);
      }
    },
    [images.length, onIndexChange, width]
  );

  return (
    <ScrollView
      ref={ref}
      horizontal
      pagingEnabled
      bounces
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={jumpToFirstRealPage}
      onMomentumScrollEnd={handleMomentumEnd}
      style={[
        styles.layer,
        {
          left: frame.x * scale,
          top: frame.y * scale,
          width,
          height
        }
      ]}
    >
      {loopingImages.map((image, index) => (
        <Image key={index} source={image} resizeMode={resizeMode} style={{ width, height }} />
      ))}
    </ScrollView>
  );
}

function ImageButton({ source, label, onPress, size = "icon" }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.buttonHitArea}>
      <Image source={source} resizeMode="contain" style={size === "wide" ? styles.wideButtonImage : styles.iconButtonImage} />
    </Pressable>
  );
}

function VoiceChoice({ label, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label} voice`}
      onPress={onPress}
      style={[styles.voiceChoice, selected && styles.voiceChoiceSelected]}
    >
      <Text style={[styles.voiceChoiceText, selected && styles.voiceChoiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function HomeButton({ title, onPress, primary = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.homeButton,
        primary ? styles.homeButtonPrimary : styles.homeButtonSecondary,
        pressed && styles.homeButtonPressed
      ]}
    >
      <Text style={[styles.homeButtonText, primary ? styles.homeButtonTextPrimary : styles.homeButtonTextSecondary]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#000"
  },
  fullScreen: {
    flex: 1
  },
  homeScreen: {
    flex: 1,
    backgroundColor: "#63B7F2"
  },
  homeSafeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 28
  },
  homeLogoArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 18
  },
  homeLogo: {
    borderRadius: 22
  },
  homeButtons: {
    width: "100%",
    maxWidth: 360,
    gap: 12
  },
  homeButton: {
    minHeight: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4
  },
  homeButtonPrimary: {
    backgroundColor: "#FDD23E",
    borderColor: "#E85B42"
  },
  homeButtonSecondary: {
    backgroundColor: "#FFFFFF",
    borderColor: "#1C78D0"
  },
  homeButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.86
  },
  homeButtonText: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0
  },
  homeButtonTextPrimary: {
    color: "#1C78D0"
  },
  homeButtonTextSecondary: {
    color: "#E85B42"
  },
  safeOverlay: {
    flex: 1,
    alignItems: "flex-start",
    padding: 16
  },
  playScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000"
  },
  canvas: {
    overflow: "hidden",
    backgroundColor: "#000"
  },
  dressCanvas: {
    backgroundColor: "#F8EAA2"
  },
  dressPaper: {
    position: "absolute",
    backgroundColor: "#F8EAA2"
  },
  layer: {
    position: "absolute",
    overflow: "hidden"
  },
  nameBadge: {
    width: "100%",
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "#FDD23E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4
  },
  characterName: {
    color: "#1C78D0",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center"
  },
  controls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16
  },
  screenBadge: {
    minWidth: 150,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "#FDD23E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4
  },
  screenBadgeText: {
    color: "#E85B42",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0
  },
  nameArea: {
    flex: 1,
    maxWidth: 230,
    marginHorizontal: 10,
    alignItems: "center"
  },
  voiceToggle: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6
  },
  voiceChoice: {
    minWidth: 70,
    minHeight: 30,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1C78D0",
    backgroundColor: "rgba(255, 255, 255, 0.9)"
  },
  voiceChoiceSelected: {
    borderColor: "#E85B42",
    backgroundColor: "#FDD23E"
  },
  voiceChoiceText: {
    color: "#1C78D0",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0
  },
  voiceChoiceTextSelected: {
    color: "#E85B42"
  },
  buttonHitArea: {
    minWidth: 56,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center"
  },
  iconButtonImage: {
    width: 48,
    height: 48
  },
  wideButtonImage: {
    width: 160,
    height: 58
  }
});
