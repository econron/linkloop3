# 追加仕様その3

```json
 {
      "unitId": {
        "S": "1"
      },
      "phrase": {
        "S": "light"
      },
      "userId": {
        "S": "test-user"
      },
      "rawResult": {
        "M": {
          "RecognitionStatus": {
            "S": "Success"
          },
          "SNR": {
            "N": "21.14697"
          },
          "Channel": {
            "N": "0"
          },
          "DisplayText": {
            "S": "Light."
          },
          "NBest": {
            "L": [
              {
                "M": {
                  "MaskedITN": {
                    "S": "light"
                  },
                  "ITN": {
                    "S": "light"
                  },
                  "Confidence": {
                    "N": "0.94468564"
                  },
                  "Words": {
                    "L": [
                      {
                        "M": {
                          "Phonemes": {
                            "L": [
                              {
                                "M": {
                                  "PronunciationAssessment": {
                                    "M": {
                                      "AccuracyScore": {
                                        "N": "32"
                                      },
                                      "NBestPhonemes": {
                                        "L": [
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "r"
                                              },
                                              "Score": {
                                                "N": "100"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "ao"
                                              },
                                              "Score": {
                                                "N": "93"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "l"
                                              },
                                              "Score": {
                                                "N": "24"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "aa"
                                              },
                                              "Score": {
                                                "N": "15"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "ax"
                                              },
                                              "Score": {
                                                "N": "8"
                                              }
                                            }
                                          }
                                        ]
                                      }
                                    }
                                  },
                                  "Duration": {
                                    "N": "1900000"
                                  },
                                  "Phoneme": {
                                    "S": "l"
                                  },
                                  "Offset": {
                                    "N": "8900000"
                                  }
                                }
                              },
                              {
                                "M": {
                                  "PronunciationAssessment": {
                                    "M": {
                                      "AccuracyScore": {
                                        "N": "66"
                                      },
                                      "NBestPhonemes": {
                                        "L": [
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "ay"
                                              },
                                              "Score": {
                                                "N": "100"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "r"
                                              },
                                              "Score": {
                                                "N": "40"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "t"
                                              },
                                              "Score": {
                                                "N": "30"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "ey"
                                              },
                                              "Score": {
                                                "N": "4"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "ih"
                                              },
                                              "Score": {
                                                "N": "2"
                                              }
                                            }
                                          }
                                        ]
                                      }
                                    }
                                  },
                                  "Duration": {
                                    "N": "1100000"
                                  },
                                  "Phoneme": {
                                    "S": "ay"
                                  },
                                  "Offset": {
                                    "N": "10900000"
                                  }
                                }
                              },
                              {
                                "M": {
                                  "PronunciationAssessment": {
                                    "M": {
                                      "AccuracyScore": {
                                        "N": "92"
                                      },
                                      "NBestPhonemes": {
                                        "L": [
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "t"
                                              },
                                              "Score": {
                                                "N": "100"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "d"
                                              },
                                              "Score": {
                                                "N": "36"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "ow"
                                              },
                                              "Score": {
                                                "N": "30"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "s"
                                              },
                                              "Score": {
                                                "N": "18"
                                              }
                                            }
                                          },
                                          {
                                            "M": {
                                              "Phoneme": {
                                                "S": "n"
                                              },
                                              "Score": {
                                                "N": "10"
                                              }
                                            }
                                          }
                                        ]
                                      }
                                    }
                                  },
                                  "Duration": {
                                    "N": "3500000"
                                  },
                                  "Phoneme": {
                                    "S": "t"
                                  },
                                  "Offset": {
                                    "N": "12100000"
                                  }
                                }
                              }
                            ]
                          },
                          "Duration": {
                            "N": "6700000"
                          },
                          "PronunciationAssessment": {
                            "M": {
                              "ErrorType": {
                                "S": "None"
                              },
                              "AccuracyScore": {
                                "N": "78"
                              },
                              "Feedback": {
                                "M": {
                                  "Prosody": {
                                    "M": {
                                      "Break": {
                                        "M": {
                                          "ErrorTypes": {
                                            "L": [
                                              {
                                                "S": "None"
                                              }
                                            ]
                                          },
                                          "BreakLength": {
                                            "N": "0"
                                          }
                                        }
                                      },
                                      "Intonation": {
                                        "M": {
                                          "Monotone": {
                                            "M": {
                                              "SyllablePitchDeltaConfidence": {
                                                "N": "0.50218755"
                                              }
                                            }
                                          },
                                          "ErrorTypes": {
                                            "L": []
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "Word": {
                            "S": "light"
                          },
                          "Syllables": {
                            "L": [
                              {
                                "M": {
                                  "PronunciationAssessment": {
                                    "M": {
                                      "AccuracyScore": {
                                        "N": "70"
                                      }
                                    }
                                  },
                                  "Duration": {
                                    "N": "6700000"
                                  },
                                  "Grapheme": {
                                    "S": "light"
                                  },
                                  "Syllable": {
                                    "S": "layt"
                                  },
                                  "Offset": {
                                    "N": "8900000"
                                  }
                                }
                              }
                            ]
                          },
                          "Offset": {
                            "N": "8900000"
                          }
                        }
                      }
                    ]
                  },
                  "PronunciationAssessment": {
                    "M": {
                      "FluencyScore": {
                        "N": "100"
                      },
                      "PronScore": {
                        "N": "77.4"
                      },
                      "AccuracyScore": {
                        "N": "78"
                      },
                      "ProsodyScore": {
                        "N": "54.6"
                      },
                      "CompletenessScore": {
                        "N": "100"
                      }
                    }
                  },
                  "Lexical": {
                    "S": "light"
                  },
                  "Display": {
                    "S": "Light."
                  }
                }
              }
            ]
          },
          "Duration": {
            "N": "6700000"
          },
          "Id": {
            "S": "37abd812f5ae43ac9d8318253491e6a9"
          },
          "Offset": {
            "N": "8900000"
          }
        }
      },
      "timestamp": {
        "S": "2025-06-08T01:21:01.180Z"
      }
    }
```

レスポンスは上記jsonのrawresultの箇所に当たる。

レスポンス仕様は下記を参照。

https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment?pivots=programming-language-javascript

この仕様に従い、/practiceページにて、
例えば/r/と/l/のレッスンであれば該当する発音箇所でスコアが90以下のところをユーザーにフィードバックとして表示する機能が欲しい。

