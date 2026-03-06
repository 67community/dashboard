"use client"

import { useState, useMemo } from "react"

interface MediaItem {
  name: string
  url: string
  type: "image" | "video"
}

const FILES: MediaItem[] = [
  { name: "1-67ski-edited.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/1-67ski-edited.mp4", type: "video" },
  { name: "10-67b.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/10-67b.mp4", type: "video" },
  { name: "11-queen.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/11-queen.mp4", type: "video" },
  { name: "13-stan.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/13-stan.mp4", type: "video" },
  { name: "14-bus.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/14-bus.mp4", type: "video" },
  { name: "15-olympics.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/15-olympics.mp4", type: "video" },
  { name: "16-vietnam.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/16-vietnam.mp4", type: "video" },
  { name: "17-davos.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/17-davos.mp4", type: "video" },
  { name: "18-dominican.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/18-dominican.mp4", type: "video" },
  { name: "19-rave.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/19-rave.mp4", type: "video" },
  { name: "2-daxsong.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/2-daxsong.mp4", type: "video" },
  { name: "20-longevity.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/20-longevity.mp4", type: "video" },
  { name: "22-barron.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/22-barron.mp4", type: "video" },
  { name: "24-sports.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/24-sports.mp4", type: "video" },
  { name: "26-lilgodd.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/26-lilgodd.mp4", type: "video" },
  { name: "27-valentines.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/27-valentines.mp4", type: "video" },
  { name: "3-@6ix9ine.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/3-%406ix9ine.mp4", type: "video" },
  { name: "39.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/39.mp4", type: "video" },
  { name: "4-247.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/4-247.mp4", type: "video" },
  { name: "6-bus.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/6-bus.mp4", type: "video" },
  { name: "67 Coin_Merry.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20Coin_Merry.mp4", type: "video" },
  { name: "67 Crowd Hype.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20Crowd%20Hype.mp4", type: "video" },
  { name: "67 Faze Ronaldo.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20Faze%20Ronaldo.mp4", type: "video" },
  { name: "67 Film by wjponchain.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20Film%20by%20wjponchain.mp4", type: "video" },
  { name: "67 Hopper.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20Hopper.mp4", type: "video" },
  { name: "67 In-N-Out 1 POV1.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20In-N-Out%201%20POV1.mp4", type: "video" },
  { name: "67 In-N-Out 1 POV2.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20In-N-Out%201%20POV2.mp4", type: "video" },
  { name: "67 In-N-Out 1 POV3.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20In-N-Out%201%20POV3.mp4", type: "video" },
  { name: "67 In-N-Out 2.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20In-N-Out%202.mp4", type: "video" },
  { name: "67 In-N-Out 3.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20In-N-Out%203.mp4", type: "video" },
  { name: "67 Influencers.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20Influencers.mp4", type: "video" },
  { name: "67 MORE GIF.gif.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20MORE%20GIF.gif.mp4", type: "video" },
  { name: "67 Outro.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20Outro.mp4", type: "video" },
  { name: "67 Short Remixxxxx.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20Short%20Remixxxxx.mp4", type: "video" },
  { name: "67 Trump Christmas Edit with URL.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20Trump%20Christmas%20Edit%20with%20URL.mp4", type: "video" },
  { name: "67 Trump.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20Trump.mp4", type: "video" },
  { name: "67 in the morning.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20in%20the%20morning.mp4", type: "video" },
  { name: "67 on a merry rizzmas.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67%20on%20a%20merry%20rizzmas.mp4", type: "video" },
  { name: "67-icurina.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67-icurina.mp4", type: "video" },
  { name: "67_Bullet Train.mov", url: "https://raw.githubusercontent.com/67coin/Library/main/67_Bullet%20Train.mov", type: "video" },
  { name: "67_Cat.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67_Cat.mp4", type: "video" },
  { name: "67_Jimmy_Alive and Well.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/67_Jimmy_Alive%20and%20Well.mp4", type: "video" },
  { name: "7-mrbeast67.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/7-mrbeast67.mp4", type: "video" },
  { name: "8-lol.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/8-lol.mp4", type: "video" },
  { name: "9-road.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/9-road.mp4", type: "video" },
  { name: "ALL IN.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/ALL%20IN.mp4", type: "video" },
  { name: "Bot Media.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/Bot%20Media.mp4", type: "video" },
  { name: "Dax_67.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/Dax_67.mp4", type: "video" },
  { name: "IMG_0217.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0217.MP4", type: "video" },
  { name: "IMG_0222.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0222.MOV", type: "video" },
  { name: "IMG_0250.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0250.MOV", type: "video" },
  { name: "IMG_0319.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0319.MOV", type: "video" },
  { name: "IMG_0321.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0321.MOV", type: "video" },
  { name: "IMG_0323.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0323.MOV", type: "video" },
  { name: "IMG_0325.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0325.MOV", type: "video" },
  { name: "IMG_0331.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0331.MOV", type: "video" },
  { name: "IMG_0337.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0337.MOV", type: "video" },
  { name: "IMG_0338.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0338.MOV", type: "video" },
  { name: "IMG_0350.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0350.MOV", type: "video" },
  { name: "IMG_0361.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0361.MP4", type: "video" },
  { name: "IMG_0365.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0365.MOV", type: "video" },
  { name: "IMG_0370.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0370.MOV", type: "video" },
  { name: "IMG_0373.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0373.MOV", type: "video" },
  { name: "IMG_0386.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0386.MOV", type: "video" },
  { name: "IMG_0398.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0398.MOV", type: "video" },
  { name: "IMG_0403.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0403.MOV", type: "video" },
  { name: "IMG_0422.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0422.MOV", type: "video" },
  { name: "IMG_0481.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0481.MOV", type: "video" },
  { name: "IMG_0493.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0493.MOV", type: "video" },
  { name: "IMG_0508.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0508.MOV", type: "video" },
  { name: "IMG_0898.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_0898.MP4", type: "video" },
  { name: "IMG_1158.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_1158.MP4", type: "video" },
  { name: "IMG_2580.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_2580.MOV", type: "video" },
  { name: "IMG_5023.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5023.MP4", type: "video" },
  { name: "IMG_5024.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5024.MP4", type: "video" },
  { name: "IMG_5025.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5025.MP4", type: "video" },
  { name: "IMG_5026.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5026.MP4", type: "video" },
  { name: "IMG_5027.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5027.MP4", type: "video" },
  { name: "IMG_5087.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5087.MP4", type: "video" },
  { name: "IMG_5088.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5088.MP4", type: "video" },
  { name: "IMG_5120.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5120.MP4", type: "video" },
  { name: "IMG_5158.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5158.MP4", type: "video" },
  { name: "IMG_5190.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5190.MP4", type: "video" },
  { name: "IMG_5191.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5191.MP4", type: "video" },
  { name: "IMG_5192.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5192.MP4", type: "video" },
  { name: "IMG_5193.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5193.MP4", type: "video" },
  { name: "IMG_5194.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5194.MP4", type: "video" },
  { name: "IMG_5195.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5195.MP4", type: "video" },
  { name: "IMG_5196.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5196.MP4", type: "video" },
  { name: "IMG_5208.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5208.MP4", type: "video" },
  { name: "IMG_5391.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5391.MP4", type: "video" },
  { name: "IMG_5521.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5521.MP4", type: "video" },
  { name: "IMG_5522.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5522.MP4", type: "video" },
  { name: "IMG_5525.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5525.MP4", type: "video" },
  { name: "IMG_5573.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_5573.MP4", type: "video" },
  { name: "IMG_6148.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_6148.MOV", type: "video" },
  { name: "IMG_6199.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_6199.MP4", type: "video" },
  { name: "IMG_6337.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_6337.MP4", type: "video" },
  { name: "IMG_6475.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_6475.MP4", type: "video" },
  { name: "IMG_6980.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_6980.MP4", type: "video" },
  { name: "IMG_7104.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7104.MOV", type: "video" },
  { name: "IMG_7187.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7187.MP4", type: "video" },
  { name: "IMG_7188.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7188.MP4", type: "video" },
  { name: "IMG_7194.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7194.MOV", type: "video" },
  { name: "IMG_7260.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7260.MP4", type: "video" },
  { name: "IMG_7560.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7560.MOV", type: "video" },
  { name: "IMG_7565.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7565.MOV", type: "video" },
  { name: "IMG_7608.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7608.MOV", type: "video" },
  { name: "IMG_7609.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7609.MP4", type: "video" },
  { name: "IMG_7625.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7625.MOV", type: "video" },
  { name: "IMG_7909.MP4", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_7909.MP4", type: "video" },
  { name: "IMG_8805.MOV", url: "https://raw.githubusercontent.com/67coin/Library/main/IMG_8805.MOV", type: "video" },
  { name: "My_Movie_26.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/My_Movie_26.mp4", type: "video" },
  { name: "SIX SEVENNNNNNNNN.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/SIX%20SEVENNNNNNNNN.mp4", type: "video" },
  { name: "Skrilla Concert.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/Skrilla%20Concert.mp4", type: "video" },
  { name: "South Park 67 1.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/South%20Park%2067%201.mp4", type: "video" },
  { name: "South Park 67 2.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/South%20Park%2067%202.mp4", type: "video" },
  { name: "South Park 67 3.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/South%20Park%2067%203.mp4", type: "video" },
  { name: "South Park 67 4.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/South%20Park%2067%204.mp4", type: "video" },
  { name: "South Park 67 5.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/South%20Park%2067%205.mp4", type: "video" },
  { name: "TRIPSEVENNNNN.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/TRIPSEVENNNNN.mp4", type: "video" },
  { name: "The Official 67 Coin - Christmas Variation Mobile.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/The%20Official%2067%20Coin%20-%20Christmas%20Variation%20Mobile.mp4", type: "video" },
  { name: "The Official 67 Coin - Christmas Variation.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/The%20Official%2067%20Coin%20-%20Christmas%20Variation.mp4", type: "video" },
  { name: "Trump_Santa_67.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/Trump_Santa_67.mp4", type: "video" },
  { name: "binance.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/binance.mp4", type: "video" },
  { name: "dc-young-fly-trying-not-to-laugh.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/dc-young-fly-trying-not-to-laugh.mp4", type: "video" },
  { name: "document_2025-11-11_19-28-19.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-11_19-28-19.mp4", type: "video" },
  { name: "document_2025-11-11_19-28-36.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-11_19-28-36.mp4", type: "video" },
  { name: "document_2025-11-11_19-28-44.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-11_19-28-44.mp4", type: "video" },
  { name: "document_2025-11-12_06-59-28.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-12_06-59-28.mp4", type: "video" },
  { name: "document_2025-11-12_07-53-41.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-12_07-53-41.mp4", type: "video" },
  { name: "document_2025-11-12_07-53-57.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-12_07-53-57.mp4", type: "video" },
  { name: "document_2025-11-12_08-01-31.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-12_08-01-31.mp4", type: "video" },
  { name: "document_2025-11-12_09-07-08.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-12_09-07-08.mp4", type: "video" },
  { name: "document_2025-11-15_21-24-28.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_21-24-28.mp4", type: "video" },
  { name: "document_2025-11-15_21-24-34.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_21-24-34.mp4", type: "video" },
  { name: "document_2025-11-15_21-24-40.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_21-24-40.mp4", type: "video" },
  { name: "document_2025-11-15_21-24-56 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_21-24-56%20%281%29.mp4", type: "video" },
  { name: "document_2025-11-15_21-24-56.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_21-24-56.mp4", type: "video" },
  { name: "document_2025-11-15_23-08-56.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_23-08-56.mp4", type: "video" },
  { name: "document_2025-11-15_23-08-57 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_23-08-57%20%281%29.mp4", type: "video" },
  { name: "document_2025-11-15_23-08-57.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_23-08-57.mp4", type: "video" },
  { name: "document_2025-11-15_23-08-58.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_23-08-58.mp4", type: "video" },
  { name: "document_2025-11-15_23-08-59.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_23-08-59.mp4", type: "video" },
  { name: "document_2025-11-15_23-09-00.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_23-09-00.mp4", type: "video" },
  { name: "document_2025-11-15_23-39-18.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-15_23-39-18.mp4", type: "video" },
  { name: "document_2025-11-17_13-01-33.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-17_13-01-33.mp4", type: "video" },
  { name: "document_2025-11-19_06-28-24.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-19_06-28-24.mp4", type: "video" },
  { name: "document_2025-11-23_00-58-21.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-23_00-58-21.mp4", type: "video" },
  { name: "document_2025-11-24_14-01-41.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-24_14-01-41.mp4", type: "video" },
  { name: "document_2025-11-24_14-58-34.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-24_14-58-34.mp4", type: "video" },
  { name: "document_2025-11-25_22-55-42.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-25_22-55-42.mp4", type: "video" },
  { name: "document_2025-11-26_21-10-24.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-26_21-10-24.mp4", type: "video" },
  { name: "document_2025-11-29_20-45-26.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-11-29_20-45-26.mp4", type: "video" },
  { name: "document_2025-12-02_12-48-33.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-02_12-48-33.mp4", type: "video" },
  { name: "document_2025-12-04_05-26-39.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-04_05-26-39.mp4", type: "video" },
  { name: "document_2025-12-04_05-35-07.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-04_05-35-07.mp4", type: "video" },
  { name: "document_2025-12-04_17-51-18.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-04_17-51-18.mp4", type: "video" },
  { name: "document_2025-12-06_01-33-58.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-06_01-33-58.mp4", type: "video" },
  { name: "document_2025-12-06_01-34-04.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-06_01-34-04.mp4", type: "video" },
  { name: "document_2025-12-07_13-43-02.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_13-43-02.mp4", type: "video" },
  { name: "document_2025-12-07_13-43-06.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_13-43-06.mp4", type: "video" },
  { name: "document_2025-12-07_13-43-17.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_13-43-17.mp4", type: "video" },
  { name: "document_2025-12-07_13-43-29.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_13-43-29.mp4", type: "video" },
  { name: "document_2025-12-07_13-44-18 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_13-44-18%20%281%29.mp4", type: "video" },
  { name: "document_2025-12-07_13-44-18 (2).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_13-44-18%20%282%29.mp4", type: "video" },
  { name: "document_2025-12-07_13-44-18 (3).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_13-44-18%20%283%29.mp4", type: "video" },
  { name: "document_2025-12-07_13-44-18.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_13-44-18.mp4", type: "video" },
  { name: "document_2025-12-07_13-44-31.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_13-44-31.mp4", type: "video" },
  { name: "document_2025-12-07_14-06-30 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-06-30%20%281%29.mp4", type: "video" },
  { name: "document_2025-12-07_14-06-30.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-06-30.mp4", type: "video" },
  { name: "document_2025-12-07_14-06-46 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-06-46%20%281%29.mp4", type: "video" },
  { name: "document_2025-12-07_14-06-46.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-06-46.mp4", type: "video" },
  { name: "document_2025-12-07_14-07-09 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-07-09%20%281%29.mp4", type: "video" },
  { name: "document_2025-12-07_14-07-09.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-07-09.mp4", type: "video" },
  { name: "document_2025-12-07_14-07-18 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-07-18%20%281%29.mp4", type: "video" },
  { name: "document_2025-12-07_14-07-18.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-07-18.mp4", type: "video" },
  { name: "document_2025-12-07_14-07-32.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-07-32.mp4", type: "video" },
  { name: "document_2025-12-07_14-07-33.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-07-33.mp4", type: "video" },
  { name: "document_2025-12-07_14-07-51 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-07-51%20%281%29.mp4", type: "video" },
  { name: "document_2025-12-07_14-07-51.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-07-51.mp4", type: "video" },
  { name: "document_2025-12-07_14-07-56 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-07-56%20%281%29.mp4", type: "video" },
  { name: "document_2025-12-07_14-07-56.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-07-56.mp4", type: "video" },
  { name: "document_2025-12-07_14-09-21.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_14-09-21.mp4", type: "video" },
  { name: "document_2025-12-07_19-16-24.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-07_19-16-24.mp4", type: "video" },
  { name: "document_2025-12-08_00-52-56.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-08_00-52-56.mp4", type: "video" },
  { name: "document_2025-12-09_03-46-42.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-09_03-46-42.mp4", type: "video" },
  { name: "document_2025-12-09_21-43-18.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-09_21-43-18.mp4", type: "video" },
  { name: "document_2025-12-10_06-57-40.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-10_06-57-40.mp4", type: "video" },
  { name: "document_2025-12-10_13-21-47.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-10_13-21-47.mp4", type: "video" },
  { name: "document_2025-12-10_14-45-23.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-10_14-45-23.mp4", type: "video" },
  { name: "document_2025-12-10_23-00-39.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-10_23-00-39.mp4", type: "video" },
  { name: "document_2025-12-11_20-05-04.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-11_20-05-04.mp4", type: "video" },
  { name: "document_2025-12-11_21-36-49.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-11_21-36-49.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-02 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-02%20%281%29.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-02 (2).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-02%20%282%29.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-02 (3).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-02%20%283%29.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-02.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-02.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-04 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-04%20%281%29.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-04 (2).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-04%20%282%29.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-04.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-04.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-06 (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-06%20%281%29.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-06 (2).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-06%20%282%29.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-06 (3).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-06%20%283%29.mp4", type: "video" },
  { name: "document_2025-12-12_18-47-06.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-12_18-47-06.mp4", type: "video" },
  { name: "document_2025-12-13_17-06-39.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-13_17-06-39.mp4", type: "video" },
  { name: "document_2025-12-15_08-18-22.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-15_08-18-22.mp4", type: "video" },
  { name: "document_2025-12-15_08-18-49.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-15_08-18-49.mp4", type: "video" },
  { name: "document_2025-12-15_08-22-31.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-15_08-22-31.mp4", type: "video" },
  { name: "document_2025-12-19_01-02-38.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-19_01-02-38.mp4", type: "video" },
  { name: "document_2025-12-19_18-23-43.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-19_18-23-43.mp4", type: "video" },
  { name: "document_2025-12-20_17-45-39.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-20_17-45-39.mp4", type: "video" },
  { name: "document_2025-12-21_19-07-31.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-21_19-07-31.mp4", type: "video" },
  { name: "document_2025-12-25_13-25-26.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2025-12-25_13-25-26.mp4", type: "video" },
  { name: "document_2026-01-05_17-40-42.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2026-01-05_17-40-42.mp4", type: "video" },
  { name: "document_2026-01-08_07-29-37.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2026-01-08_07-29-37.mp4", type: "video" },
  { name: "document_2026-01-08_19-17-12.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2026-01-08_19-17-12.mp4", type: "video" },
  { name: "document_2026-01-08_20-55-10.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2026-01-08_20-55-10.mp4", type: "video" },
  { name: "document_2026-01-14_17-07-21.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2026-01-14_17-07-21.mp4", type: "video" },
  { name: "document_2026-01-15_11-25-58.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/document_2026-01-15_11-25-58.mp4", type: "video" },
  { name: "gif2 19mb.gif.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/gif2%2019mb.gif.mp4", type: "video" },
  { name: "just-67.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/just-67.mp4", type: "video" },
  { name: "money-go-brrr.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/money-go-brrr.mp4", type: "video" },
  { name: "photo_2025-11-11_19-22-51.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-22-51.jpg", type: "image" },
  { name: "photo_2025-11-11_19-28-05.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-28-05.jpg", type: "image" },
  { name: "photo_2025-11-11_19-28-54.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-28-54.jpg", type: "image" },
  { name: "photo_2025-11-11_19-32-24.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-32-24.jpg", type: "image" },
  { name: "photo_2025-11-11_19-32-50.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-32-50.jpg", type: "image" },
  { name: "photo_2025-11-11_19-32-58.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-32-58.jpg", type: "image" },
  { name: "photo_2025-11-11_19-34-31.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-34-31.jpg", type: "image" },
  { name: "photo_2025-11-11_19-46-44 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-46-44%20%281%29.jpg", type: "image" },
  { name: "photo_2025-11-11_19-46-44.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-46-44.jpg", type: "image" },
  { name: "photo_2025-11-11_19-46-45 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-46-45%20%281%29.jpg", type: "image" },
  { name: "photo_2025-11-11_19-46-45.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-46-45.jpg", type: "image" },
  { name: "photo_2025-11-11_19-46-46.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-46-46.jpg", type: "image" },
  { name: "photo_2025-11-11_19-46-47 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-46-47%20%281%29.jpg", type: "image" },
  { name: "photo_2025-11-11_19-46-47.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-46-47.jpg", type: "image" },
  { name: "photo_2025-11-11_19-46-48 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-46-48%20%281%29.jpg", type: "image" },
  { name: "photo_2025-11-11_19-46-48.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_19-46-48.jpg", type: "image" },
  { name: "photo_2025-11-11_20-05-33.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_20-05-33.jpg", type: "image" },
  { name: "photo_2025-11-11_21-03-53.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-11_21-03-53.jpg", type: "image" },
  { name: "photo_2025-11-12_04-31-21.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-12_04-31-21.jpg", type: "image" },
  { name: "photo_2025-11-12_10-13-48.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-12_10-13-48.jpg", type: "image" },
  { name: "photo_2025-11-12_15-34-41.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-12_15-34-41.jpg", type: "image" },
  { name: "photo_2025-11-12_20-05-54.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-12_20-05-54.jpg", type: "image" },
  { name: "photo_2025-11-12_20-13-25 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-12_20-13-25%20%281%29.jpg", type: "image" },
  { name: "photo_2025-11-12_20-13-25.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-12_20-13-25.jpg", type: "image" },
  { name: "photo_2025-11-14_12-28-38.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-14_12-28-38.jpg", type: "image" },
  { name: "photo_2025-11-14_12-37-58.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-14_12-37-58.jpg", type: "image" },
  { name: "photo_2025-11-14_18-21-15.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-14_18-21-15.jpg", type: "image" },
  { name: "photo_2025-11-15_04-09-51.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-15_04-09-51.jpg", type: "image" },
  { name: "photo_2025-11-15_10-23-50.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-15_10-23-50.jpg", type: "image" },
  { name: "photo_2025-11-15_17-36-41.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-15_17-36-41.jpg", type: "image" },
  { name: "photo_2025-11-15_23-08-58.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-15_23-08-58.jpg", type: "image" },
  { name: "photo_2025-11-15_23-08-59.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-15_23-08-59.jpg", type: "image" },
  { name: "photo_2025-11-15_23-09-00.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-15_23-09-00.jpg", type: "image" },
  { name: "photo_2025-11-15_23-09-05.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-15_23-09-05.jpg", type: "image" },
  { name: "photo_2025-11-16_03-10-54.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_03-10-54.jpg", type: "image" },
  { name: "photo_2025-11-16_03-10-55.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_03-10-55.jpg", type: "image" },
  { name: "photo_2025-11-16_03-10-56 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_03-10-56%20%281%29.jpg", type: "image" },
  { name: "photo_2025-11-16_03-10-56.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_03-10-56.jpg", type: "image" },
  { name: "photo_2025-11-16_03-10-57.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_03-10-57.jpg", type: "image" },
  { name: "photo_2025-11-16_03-10-58 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_03-10-58%20%281%29.jpg", type: "image" },
  { name: "photo_2025-11-16_03-10-58.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_03-10-58.jpg", type: "image" },
  { name: "photo_2025-11-16_14-28-46.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_14-28-46.jpg", type: "image" },
  { name: "photo_2025-11-16_14-28-50.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_14-28-50.jpg", type: "image" },
  { name: "photo_2025-11-16_15-54-03.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_15-54-03.jpg", type: "image" },
  { name: "photo_2025-11-16_18-04-39.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_18-04-39.jpg", type: "image" },
  { name: "photo_2025-11-16_19-23-50.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_19-23-50.jpg", type: "image" },
  { name: "photo_2025-11-16_20-25-53.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-16_20-25-53.jpg", type: "image" },
  { name: "photo_2025-11-17_01-35-06.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-17_01-35-06.jpg", type: "image" },
  { name: "photo_2025-11-17_04-45-38 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-17_04-45-38%20%281%29.jpg", type: "image" },
  { name: "photo_2025-11-17_04-45-38.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-17_04-45-38.jpg", type: "image" },
  { name: "photo_2025-11-17_04-45-39.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-17_04-45-39.jpg", type: "image" },
  { name: "photo_2025-11-17_04-45-40.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-17_04-45-40.jpg", type: "image" },
  { name: "photo_2025-11-17_18-55-12.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-17_18-55-12.jpg", type: "image" },
  { name: "photo_2025-11-17_19-12-38.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-17_19-12-38.jpg", type: "image" },
  { name: "photo_2025-11-17_22-33-47.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-17_22-33-47.jpg", type: "image" },
  { name: "photo_2025-11-18_02-06-43.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-18_02-06-43.jpg", type: "image" },
  { name: "photo_2025-11-18_02-06-54.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-18_02-06-54.jpg", type: "image" },
  { name: "photo_2025-11-18_18-10-15.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-18_18-10-15.jpg", type: "image" },
  { name: "photo_2025-11-19_07-14-58 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-19_07-14-58%20%281%29.jpg", type: "image" },
  { name: "photo_2025-11-19_07-14-58.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-19_07-14-58.jpg", type: "image" },
  { name: "photo_2025-11-21_15-49-51.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-21_15-49-51.jpg", type: "image" },
  { name: "photo_2025-11-23_08-42-18.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-23_08-42-18.jpg", type: "image" },
  { name: "photo_2025-11-23_09-08-32.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-23_09-08-32.jpg", type: "image" },
  { name: "photo_2025-11-23_20-07-44.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-23_20-07-44.jpg", type: "image" },
  { name: "photo_2025-11-24_02-21-51.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-24_02-21-51.jpg", type: "image" },
  { name: "photo_2025-11-24_16-56-29.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-24_16-56-29.jpg", type: "image" },
  { name: "photo_2025-11-26_05-32-13.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-26_05-32-13.jpg", type: "image" },
  { name: "photo_2025-11-26_20-00-46.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-26_20-00-46.jpg", type: "image" },
  { name: "photo_2025-11-26_22-30-56.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-26_22-30-56.jpg", type: "image" },
  { name: "photo_2025-11-27_00-43-14.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-27_00-43-14.jpg", type: "image" },
  { name: "photo_2025-11-27_19-29-13.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-27_19-29-13.jpg", type: "image" },
  { name: "photo_2025-11-28_01-48-18.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-28_01-48-18.jpg", type: "image" },
  { name: "photo_2025-11-28_04-01-31.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-28_04-01-31.jpg", type: "image" },
  { name: "photo_2025-11-28_05-16-22.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-28_05-16-22.jpg", type: "image" },
  { name: "photo_2025-11-28_13-22-52 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-28_13-22-52%20%281%29.jpg", type: "image" },
  { name: "photo_2025-11-28_13-22-52.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-28_13-22-52.jpg", type: "image" },
  { name: "photo_2025-11-28_17-05-59.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-28_17-05-59.jpg", type: "image" },
  { name: "photo_2025-11-28_17-10-04.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-28_17-10-04.jpg", type: "image" },
  { name: "photo_2025-11-28_22-14-09.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-28_22-14-09.jpg", type: "image" },
  { name: "photo_2025-11-29_22-29-04.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-29_22-29-04.jpg", type: "image" },
  { name: "photo_2025-11-30_15-30-42.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-30_15-30-42.jpg", type: "image" },
  { name: "photo_2025-11-30_18-20-40.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-30_18-20-40.jpg", type: "image" },
  { name: "photo_2025-11-30_18-21-29.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-11-30_18-21-29.jpg", type: "image" },
  { name: "photo_2025-12-01_19-10-53.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-01_19-10-53.jpg", type: "image" },
  { name: "photo_2025-12-04_00-57-38.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-04_00-57-38.jpg", type: "image" },
  { name: "photo_2025-12-05_18-01-23.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-05_18-01-23.jpg", type: "image" },
  { name: "photo_2025-12-06_12-27-30.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-06_12-27-30.jpg", type: "image" },
  { name: "photo_2025-12-06_12-35-34.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-06_12-35-34.jpg", type: "image" },
  { name: "photo_2025-12-06_16-34-05.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-06_16-34-05.jpg", type: "image" },
  { name: "photo_2025-12-07_23-02-30.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-07_23-02-30.jpg", type: "image" },
  { name: "photo_2025-12-08_17-15-08.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-08_17-15-08.jpg", type: "image" },
  { name: "photo_2025-12-09_22-34-39.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-09_22-34-39.jpg", type: "image" },
  { name: "photo_2025-12-10_06-18-00.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-10_06-18-00.jpg", type: "image" },
  { name: "photo_2025-12-10_08-27-47.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-10_08-27-47.jpg", type: "image" },
  { name: "photo_2025-12-10_09-46-54.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-10_09-46-54.jpg", type: "image" },
  { name: "photo_2025-12-10_19-08-52.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-10_19-08-52.jpg", type: "image" },
  { name: "photo_2025-12-11_15-18-51.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-11_15-18-51.jpg", type: "image" },
  { name: "photo_2025-12-15_08-19-12.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-15_08-19-12.jpg", type: "image" },
  { name: "photo_2025-12-15_08-19-34.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-15_08-19-34.jpg", type: "image" },
  { name: "photo_2025-12-15_14-04-20.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-15_14-04-20.jpg", type: "image" },
  { name: "photo_2025-12-15_17-35-18.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-15_17-35-18.jpg", type: "image" },
  { name: "photo_2025-12-15_23-19-25.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-15_23-19-25.jpg", type: "image" },
  { name: "photo_2025-12-18_02-56-23.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_02-56-23.jpg", type: "image" },
  { name: "photo_2025-12-18_12-31-03.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-31-03.jpg", type: "image" },
  { name: "photo_2025-12-18_12-31-04.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-31-04.jpg", type: "image" },
  { name: "photo_2025-12-18_12-31-05 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-31-05%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-18_12-31-05.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-31-05.jpg", type: "image" },
  { name: "photo_2025-12-18_12-31-06 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-31-06%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-18_12-31-06.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-31-06.jpg", type: "image" },
  { name: "photo_2025-12-18_12-31-07.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-31-07.jpg", type: "image" },
  { name: "photo_2025-12-18_12-31-12.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-31-12.jpg", type: "image" },
  { name: "photo_2025-12-18_12-31-13.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-31-13.jpg", type: "image" },
  { name: "photo_2025-12-18_12-32-05 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-32-05%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-18_12-32-05.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-32-05.jpg", type: "image" },
  { name: "photo_2025-12-18_12-32-06 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-32-06%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-18_12-32-06.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-32-06.jpg", type: "image" },
  { name: "photo_2025-12-18_12-32-07 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-32-07%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-18_12-32-07.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-32-07.jpg", type: "image" },
  { name: "photo_2025-12-18_12-32-08.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-32-08.jpg", type: "image" },
  { name: "photo_2025-12-18_12-32-09 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-32-09%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-18_12-32-09.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-32-09.jpg", type: "image" },
  { name: "photo_2025-12-18_12-32-14.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-18_12-32-14.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-03 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-03%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-03.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-03.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-04 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-04%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-04.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-04.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-05.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-05.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-06 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-06%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-06.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-06.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-17.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-17.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-18.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-18.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-19 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-19%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-19.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-19.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-20 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-20%20%281%29.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-20.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-20.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-21.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-21.jpg", type: "image" },
  { name: "photo_2025-12-19_03-10-23.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-19_03-10-23.jpg", type: "image" },
  { name: "photo_2025-12-20_17-12-52.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-20_17-12-52.jpg", type: "image" },
  { name: "photo_2025-12-21_01-33-43.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-21_01-33-43.jpg", type: "image" },
  { name: "photo_2025-12-21_09-08-51.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-21_09-08-51.jpg", type: "image" },
  { name: "photo_2025-12-23_20-06-23.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-23_20-06-23.jpg", type: "image" },
  { name: "photo_2025-12-31_20-13-17.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2025-12-31_20-13-17.jpg", type: "image" },
  { name: "photo_2026-01-02_01-33-09.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-02_01-33-09.jpg", type: "image" },
  { name: "photo_2026-01-03_04-33-30.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-03_04-33-30.jpg", type: "image" },
  { name: "photo_2026-01-03_16-08-41.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-03_16-08-41.jpg", type: "image" },
  { name: "photo_2026-01-03_18-36-35.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-03_18-36-35.jpg", type: "image" },
  { name: "photo_2026-01-03_19-14-26.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-03_19-14-26.jpg", type: "image" },
  { name: "photo_2026-01-04_15-07-51 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-04_15-07-51%20%281%29.jpg", type: "image" },
  { name: "photo_2026-01-04_15-07-51.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-04_15-07-51.jpg", type: "image" },
  { name: "photo_2026-01-04_16-01-00.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-04_16-01-00.jpg", type: "image" },
  { name: "photo_2026-01-05_03-39-10.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-05_03-39-10.jpg", type: "image" },
  { name: "photo_2026-01-05_17-30-33.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-05_17-30-33.jpg", type: "image" },
  { name: "photo_2026-01-05_17-30-37.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-05_17-30-37.jpg", type: "image" },
  { name: "photo_2026-01-05_17-31-14.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-05_17-31-14.jpg", type: "image" },
  { name: "photo_2026-01-05_22-33-50.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-05_22-33-50.jpg", type: "image" },
  { name: "photo_2026-01-06_03-30-30.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-06_03-30-30.jpg", type: "image" },
  { name: "photo_2026-01-06_15-47-28.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-06_15-47-28.jpg", type: "image" },
  { name: "photo_2026-01-06_18-31-01.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-06_18-31-01.jpg", type: "image" },
  { name: "photo_2026-01-06_19-12-34.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-06_19-12-34.jpg", type: "image" },
  { name: "photo_2026-01-06_19-12-44.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-06_19-12-44.jpg", type: "image" },
  { name: "photo_2026-01-07_07-17-51.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-07_07-17-51.jpg", type: "image" },
  { name: "photo_2026-01-08_01-00-52.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-08_01-00-52.jpg", type: "image" },
  { name: "photo_2026-01-09_00-20-11.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-09_00-20-11.jpg", type: "image" },
  { name: "photo_2026-01-09_01-12-25.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-09_01-12-25.jpg", type: "image" },
  { name: "photo_2026-01-09_14-01-49.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-09_14-01-49.jpg", type: "image" },
  { name: "photo_2026-01-10_22-37-39.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-10_22-37-39.jpg", type: "image" },
  { name: "photo_2026-01-10_22-40-22.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-10_22-40-22.jpg", type: "image" },
  { name: "photo_2026-01-10_22-54-05.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-10_22-54-05.jpg", type: "image" },
  { name: "photo_2026-01-10_22-56-07.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-10_22-56-07.jpg", type: "image" },
  { name: "photo_2026-01-10_22-57-56.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-10_22-57-56.jpg", type: "image" },
  { name: "photo_2026-01-10_23-02-19.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-10_23-02-19.jpg", type: "image" },
  { name: "photo_2026-01-11_01-24-50.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-11_01-24-50.jpg", type: "image" },
  { name: "photo_2026-01-11_10-49-40.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-11_10-49-40.jpg", type: "image" },
  { name: "photo_2026-01-11_10-49-57.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-11_10-49-57.jpg", type: "image" },
  { name: "photo_2026-01-11_10-50-01.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-11_10-50-01.jpg", type: "image" },
  { name: "photo_2026-01-11_11-14-40.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-11_11-14-40.jpg", type: "image" },
  { name: "photo_2026-01-11_12-07-15.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-11_12-07-15.jpg", type: "image" },
  { name: "photo_2026-01-11_16-46-38.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-11_16-46-38.jpg", type: "image" },
  { name: "photo_2026-01-11_18-33-36.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-11_18-33-36.jpg", type: "image" },
  { name: "photo_2026-01-11_18-33-58.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-11_18-33-58.jpg", type: "image" },
  { name: "photo_2026-01-12_12-43-21.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-12_12-43-21.jpg", type: "image" },
  { name: "photo_2026-01-16_19-02-34.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-16_19-02-34.jpg", type: "image" },
  { name: "photo_2026-01-17_01-04-57.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-17_01-04-57.jpg", type: "image" },
  { name: "photo_2026-01-18_15-15-22.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-18_15-15-22.jpg", type: "image" },
  { name: "photo_2026-01-19_17-59-58.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-19_17-59-58.jpg", type: "image" },
  { name: "photo_2026-01-25_14-16-07.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-25_14-16-07.jpg", type: "image" },
  { name: "photo_2026-01-30_14-39-27.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-01-30_14-39-27.jpg", type: "image" },
  { name: "photo_2026-02-01_13-12-55.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-01_13-12-55.jpg", type: "image" },
  { name: "photo_2026-02-05_02-51-07.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-05_02-51-07.jpg", type: "image" },
  { name: "photo_2026-02-05_17-54-27.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-05_17-54-27.jpg", type: "image" },
  { name: "photo_2026-02-06_12-58-22.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-06_12-58-22.jpg", type: "image" },
  { name: "photo_2026-02-08_10-29-42.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-08_10-29-42.jpg", type: "image" },
  { name: "photo_2026-02-08_10-30-01.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-08_10-30-01.jpg", type: "image" },
  { name: "photo_2026-02-11_08-22-55.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-11_08-22-55.jpg", type: "image" },
  { name: "photo_2026-02-11_09-41-09.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-11_09-41-09.jpg", type: "image" },
  { name: "photo_2026-02-12_22-28-18.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-12_22-28-18.jpg", type: "image" },
  { name: "photo_2026-02-12_22-28-19.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-12_22-28-19.jpg", type: "image" },
  { name: "photo_2026-02-12_23-12-53.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-12_23-12-53.jpg", type: "image" },
  { name: "photo_2026-02-13_14-19-31.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-13_14-19-31.jpg", type: "image" },
  { name: "photo_2026-02-13_14-19-32 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-13_14-19-32%20%281%29.jpg", type: "image" },
  { name: "photo_2026-02-13_14-19-32.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-13_14-19-32.jpg", type: "image" },
  { name: "photo_2026-02-13_14-23-25.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-13_14-23-25.jpg", type: "image" },
  { name: "photo_2026-02-13_14-30-01.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-13_14-30-01.jpg", type: "image" },
  { name: "photo_2026-02-13_16-10-33.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-13_16-10-33.jpg", type: "image" },
  { name: "photo_2026-02-13_16-25-02.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-13_16-25-02.jpg", type: "image" },
  { name: "photo_2026-02-15_19-44-18 (1).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-15_19-44-18%20%281%29.jpg", type: "image" },
  { name: "photo_2026-02-15_19-44-18 (2).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-15_19-44-18%20%282%29.jpg", type: "image" },
  { name: "photo_2026-02-15_19-44-18 (3).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-15_19-44-18%20%283%29.jpg", type: "image" },
  { name: "photo_2026-02-15_19-44-18 (4).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-15_19-44-18%20%284%29.jpg", type: "image" },
  { name: "photo_2026-02-15_19-44-18 (5).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-15_19-44-18%20%285%29.jpg", type: "image" },
  { name: "photo_2026-02-15_19-44-18 (6).jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-15_19-44-18%20%286%29.jpg", type: "image" },
  { name: "photo_2026-02-15_19-44-18.jpg", url: "https://raw.githubusercontent.com/67coin/Library/main/photo_2026-02-15_19-44-18.jpg", type: "image" },
  { name: "sixseven-six.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/sixseven-six.mp4", type: "video" },
  { name: "sticker.webm", url: "https://raw.githubusercontent.com/67coin/Library/main/sticker.webm", type: "video" },
  { name: "video (1).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/video%20%281%29.mp4", type: "video" },
  { name: "video (2).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/video%20%282%29.mp4", type: "video" },
  { name: "video (3).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/video%20%283%29.mp4", type: "video" },
  { name: "video (4).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/video%20%284%29.mp4", type: "video" },
  { name: "video (5).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/video%20%285%29.mp4", type: "video" },
  { name: "video (6).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/video%20%286%29.mp4", type: "video" },
  { name: "video (7).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/video%20%287%29.mp4", type: "video" },
  { name: "video (8).mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/video%20%288%29.mp4", type: "video" },
  { name: "video.mp4", url: "https://raw.githubusercontent.com/67coin/Library/main/video.mp4", type: "video" }
]

type Tab = "all" | "images" | "videos"

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("all")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<MediaItem | null>(null)

  const IMAGES = FILES.filter(f => f.type === "image")
  const VIDEOS = FILES.filter(f => f.type === "video")

  const list = useMemo(() => {
    let base = tab === "images" ? IMAGES : tab === "videos" ? VIDEOS : FILES
    if (search) base = base.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    return base
  }, [tab, search])

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", padding: "24px" }}>
      <style>{`
        .lib-item:hover { transform: scale(1.02); }
        .lib-item { transition: transform 0.15s; cursor: pointer; }
        .lib-item:hover .lib-overlay { opacity: 1 !important; }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--foreground)", margin: "0 0 4px", letterSpacing: "-0.04em" }}>
          Meme Library
        </h1>
        <p style={{ fontSize: 13, color: "var(--secondary)", margin: 0 }}>
          {IMAGES.length} images · {VIDEOS.length} videos
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all","images","videos"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "6px 16px", borderRadius: 99, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 12,
              background: tab === t ? "#F5A623" : "var(--fill-primary)",
              color: tab === t ? "#000" : "var(--secondary)"
            }}>
              {t === "all" ? `All (${FILES.length})` : t === "images" ? `Images (${IMAGES.length})` : `Videos (${VIDEOS.length})`}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ flex: 1, minWidth: 200, padding: "6px 14px", borderRadius: 10,
            border: "1px solid var(--separator)", background: "var(--fill-primary)",
            color: "var(--foreground)", fontSize: 13 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
        {list.map(item => (
          <div key={item.name} className="lib-item" onClick={() => setSelected(item)}
            style={{ borderRadius: 12, overflow: "hidden", background: "var(--card)",
              border: "1px solid var(--separator)", aspectRatio: "16/9", position: "relative" }}>
            {item.type === "video" ? (
              <video src={item.url} muted playsInline preload="metadata"
                onLoadedMetadata={e => { (e.target as HTMLVideoElement).currentTime = 1 }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <img src={item.url} alt={item.name} loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            {item.type === "video" && (
              <div style={{ position: "absolute", top: 6, left: 6, background: "rgba(0,0,0,0.65)",
                borderRadius: 4, padding: "2px 6px", fontSize: 9, color: "#fff", fontWeight: 700 }}>
                VIDEO
              </div>
            )}
            <div className="lib-overlay" style={{ position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end",
              justifyContent: "center", opacity: 0, transition: "opacity 0.15s", paddingBottom: 10 }}>
              <a href={item.url} download={item.name} onClick={e => e.stopPropagation()}
                style={{ padding: "5px 14px", borderRadius: 8, background: "#F5A623",
                  color: "#000", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {list.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--secondary)", fontSize: 14 }}>
          No files found
        </div>
      )}

      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          flexDirection: "column", gap: 16
        }}>
          <button onClick={() => setSelected(null)} style={{
            position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)",
            border: "none", color: "#fff", fontSize: 20, borderRadius: "50%",
            width: 36, height: 36, cursor: "pointer"
          }}>✕</button>

          {selected.type === "video" ? (
            <video src={selected.url} controls autoPlay
              style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: 12 }}
              onClick={e => e.stopPropagation()} />
          ) : (
            <img src={selected.url} alt={selected.name}
              style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: 12, objectFit: "contain" }}
              onClick={e => e.stopPropagation()} />
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{selected.name}</span>
            <a href={selected.url} download={selected.name} onClick={e => e.stopPropagation()}
              style={{ padding: "6px 18px", borderRadius: 8, background: "#F5A623",
                color: "#000", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
