	.ORG $8000
	lda #$80
	sta $8000
	.repeat 100
		LDA #$80
		STA $2007
	.endr
	ORA #$20
	PHA
	PLA
